import { getFormatter } from "$lib/server/i18n";
import { itemEmitter } from "$lib/server/events/emitters";
import { client } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { listItemClaimSchema } from "$lib/server/validations";
import type { Prisma } from "$lib/generated/prisma/client";
import { getItemInclusions } from "$lib/server/items";
import { ItemEvent } from "$lib/events";
import { logger } from "$lib/server/logger";
import z from "zod";
import { getActiveMembership } from "$lib/server/group-membership";
import { getConfig } from "$lib/server/config";
import { sendClaimConfirmation } from "$lib/server/email";
import generateToken, { hashToken } from "$lib/server/token";

// Mirrors ItemImage.svelte: an absolute URL is used as-is, anything else is an
// upload id. Emails need absolute URLs, so relative ones are resolved here.
const toAbsoluteImageUrl = (imageUrl: string | null, base: URL) => {
    if (!imageUrl) return undefined;
    try {
        return new URL(imageUrl).href;
    } catch {
        if (imageUrl.startsWith("/") || imageUrl.endsWith("/")) return undefined;
        return new URL(`/api/assets/${imageUrl}`, base).href;
    }
};

// Claim an item on a list
export const PUT: RequestHandler = async ({ locals, request, params, url }) => {
    const $t = await getFormatter();

    const itemId = parseInt(params.itemId);
    if (isNaN(itemId)) {
        error(400, $t("errors.item-id-must-be-a-number"));
    }

    const body = (await request.json()) as Record<string, unknown>[];
    const updateData = listItemClaimSchema.safeParse(body);

    if (updateData.error) {
        error(422, JSON.stringify(z.flattenError(updateData.error).fieldErrors));
    }
    if (!updateData.data.claimedById && !updateData.data.publicClaimedById) {
        error(400, $t("errors.claimed-by-user-must-be-specified"));
    }

    const list = await client.list.findUnique({
        select: {
            id: true,
            name: true,
            public: true,
            groupId: true,
            allowSelfClaims: true,
            notForMe: true,
            ownerId: true,
            owner: {
                select: {
                    preferredLanguage: true
                }
            }
        },
        where: {
            id: params.listId
        }
    });

    if (!list) {
        error(404, $t("errors.list-not-found"));
    }

    if (updateData.data.claimedById !== undefined && updateData.data.claimedById !== null) {
        if (!locals.user) {
            error(401, $t("errors.unauthenticated"));
        } else if (locals.user.id !== updateData.data.claimedById) {
            error(403, $t("errors.no-claim-on-behalf-of"));
        }
    }
    if (updateData.data.publicClaimedById && !list.public) {
        error(404, $t("errors.list-not-found"));
    }

    const isSelfClaimable = list.allowSelfClaims || list.notForMe;
    if (updateData.data.claimedById === list.ownerId && !isSelfClaimable) {
        error(400, $t("errors.this-list-does-not-allow-self-claimed-items"));
    }

    const item = await client.item.findUnique({
        select: {
            id: true,
            name: true,
            imageUrl: true,
            quantity: true,
            claims: {
                select: {
                    quantity: true
                }
            }
        },
        where: {
            id: itemId,
            lists: {
                some: {
                    listId: list.id
                }
            }
        }
    });

    if (!item) {
        error(404, $t("errors.item-not-found-on-list"));
    }

    if (locals.user) {
        const activeGroupId = (await getActiveMembership(locals.user)).groupId;
        if (activeGroupId !== list.groupId) {
            error(403, $t("errors.this-list-is-not-part-of-your-active-group"));
        }
    }

    const claimedQuantity = item.claims.reduce((a, { quantity }) => a + quantity, 0);
    if (item.quantity !== null && claimedQuantity + updateData.data.quantity > item.quantity) {
        error(
            422,
            $t("errors.could-not-claim-quantity-items", {
                values: { quantity: updateData.data.quantity, availableQuantity: item.quantity - claimedQuantity }
            })
        );
    }

    // Public claimers have no account, so a token is their only way back to the
    // claim: it is returned to the browser that made the claim and, when they
    // gave an email address, sent to them as a link
    const publicClaimerEmail = updateData.data.publicClaimedById
        ? (
              await client.systemUser.findUnique({
                  select: { username: true },
                  where: { id: updateData.data.publicClaimedById }
              })
          )?.username
        : null;
    const claimToken = updateData.data.publicClaimedById ? await generateToken() : undefined;

    let claimId: string;
    try {
        const data: Prisma.ItemClaimCreateInput = {
            item: {
                connect: {
                    id: item.id
                }
            },
            list: {
                connect: {
                    id: list.id
                }
            },
            quantity: updateData.data.quantity
        };
        if (updateData.data.claimedById) {
            data.claimedBy = {
                connect: {
                    id: updateData.data.claimedById
                }
            };
        } else if (updateData.data.publicClaimedById) {
            data.publicClaimedBy = {
                connect: {
                    id: updateData.data.publicClaimedById
                }
            };
        }

        if (claimToken) {
            data.hashedToken = hashToken(claimToken);
        }

        ({ id: claimId } = await client.itemClaim.create({ data, select: { id: true } }));
        const updatedItem = await client.item.findUnique({
            where: {
                id: item.id
            },
            include: getItemInclusions()
        });
        if (updatedItem) itemEmitter.emit(ItemEvent.ITEM_UPDATE, updatedItem);
    } catch (err) {
        logger.error({ err }, "Error claiming item");
        error(422, $t("general.oops"));
    }

    // The claim is already saved at this point, so a failure to send the
    // confirmation must not fail the request
    if (claimToken && publicClaimerEmail) {
        try {
            const config = await getConfig(list.groupId);
            if (config.smtp.enable) {
                const manageUrl = new URL(`/claims/manage?token=${claimToken}`, url);
                const listUrl = new URL(`/lists/${list.id}`, url);
                const { success, message } = await sendClaimConfirmation(publicClaimerEmail, {
                    manageUrl: manageUrl.href,
                    listUrl: listUrl.href,
                    listName: list.name,
                    itemName: item.name,
                    itemImageUrl: toAbsoluteImageUrl(item.imageUrl, url),
                    // The claimer has no account to take a language from. The
                    // owner's preference matches the list they were looking at;
                    // without one, getFormatter falls back to this request's
                    // language, which is the claimer's own browser
                    locale: list.owner.preferredLanguage ?? undefined
                });
                if (!success) {
                    logger.error({ message }, "Unable to send claim confirmation email");
                }
            }
        } catch (err) {
            logger.error({ err }, "Unable to send claim confirmation email");
        }
    }

    if (claimToken) {
        return new Response(JSON.stringify({ claimId, token: claimToken }), {
            status: 200,
            headers: { "content-type": "application/json" }
        });
    }
    return new Response(null, { status: 200 });
};
