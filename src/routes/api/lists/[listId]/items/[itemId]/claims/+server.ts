import { getFormatter } from "$lib/server/i18n";
import { itemEmitter } from "$lib/server/events/emitters";
import { client } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { listItemClaimSchema } from "$lib/server/validations";
import type { Prisma } from "@prisma/client";
import { getItemInclusions } from "$lib/server/items";
import { ItemEvent } from "$lib/events";
import { logger } from "$lib/server/logger";
import z from "zod";
import { getConfig } from "$lib/server/config";

// Claim an item on a list
export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const $t = await getFormatter();

    const body = (await request.json()) as Record<string, unknown>[];
    const updateData = listItemClaimSchema.safeParse(body);

    if (updateData.error) {
        error(422, JSON.stringify(z.flattenError(updateData.error).fieldErrors));
    }
    if (!updateData.data.claimedById && !updateData.data.publicClaimedById) {
        error(400, $t("errors.claimed-by-user-must-be-specified"));
    }

    // Validate email requirement for public claims
    if (updateData.data.publicClaimedById) {
        const config = await getConfig();
        if (config.claims.requireEmail) {
            // Find the system user to check if username is an email
            const systemUser = await client.systemUser.findUnique({
                where: {
                    id: updateData.data.publicClaimedById
                }
            });

            if (!systemUser || !systemUser.username.includes("@")) {
                error(422, $t("errors.email-is-required-for-public-claims"));
            }
        }
    }

    const list = await client.list.findUnique({
        select: {
            id: true,
            public: true
        },
        where: {
            id: params.listId
        }
    });

    if (!list) {
        error(404, $t("errors.list-not-found"));
    }

    if (updateData.data.claimedById !== undefined && updateData.data.claimedById !== null) {
        if (!locals.user) error(401, $t("errors.unauthenticated"));
    }
    if (updateData.data.publicClaimedById && !list.public) {
        error(404, $t("errors.list-not-found"));
    }

    if (isNaN(parseInt(params.itemId))) {
        error(400, $t("errors.item-id-must-be-a-number"));
    }

    const item = await client.item.findUnique({
        select: {
            id: true,
            quantity: true,
            claims: {
                select: {
                    quantity: true
                }
            }
        },
        where: {
            id: parseInt(params.itemId),
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

    const claimedQuantity = item.claims.reduce((a, { quantity }) => a + quantity, 0);
    if (item.quantity !== null && claimedQuantity + updateData.data.quantity > item.quantity) {
        error(
            422,
            $t("errors.could-not-claim-quantity-items", {
                values: { quantity: updateData.data.quantity, availableQuantity: item.quantity - claimedQuantity }
            })
        );
    }

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

        await client.itemClaim.create({ data });
        const updatedItem = await client.item.findUnique({
            where: {
                id: item.id
            },
            include: getItemInclusions()
        });
        if (updatedItem) itemEmitter.emit(ItemEvent.ITEM_UPDATE, updatedItem);

        return new Response(null, { status: 200 });
    } catch (err) {
        logger.error({ err }, "Error claiming item");
        error(404, $t("errors.item-not-found"));
    }
};
