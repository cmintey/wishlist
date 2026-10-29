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
            public: true,
            groupId: true,
            allowSelfClaims: true,
            notForMe: true,
            ownerId: true
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

    // Public claimers have no account, so they get a tokenized link emailed to them
    // as their only way back to the claim
    const publicClaimerEmail = updateData.data.publicClaimedById
        ? (
              await client.systemUser.findUnique({
                  select: { username: true },
                  where: { id: updateData.data.publicClaimedById }
              })
          )?.username
        : null;
    const claimToken = publicClaimerEmail ? await generateToken() : undefined;

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

        await client.itemClaim.create({ data });
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
                const { success, message } = await sendClaimConfirmation(publicClaimerEmail, manageUrl.href, item.name);
                if (!success) {
                    logger.error({ message }, "Unable to send claim confirmation email");
                }
            }
        } catch (err) {
            logger.error({ err }, "Unable to send claim confirmation email");
        }
    }

    return new Response(null, { status: 200 });
};
