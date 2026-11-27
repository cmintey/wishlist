import { getFormatter } from "$lib/server/i18n";
import { itemEmitter } from "$lib/server/events/emitters";
import { client } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { listItemClaimSchema } from "$lib/server/validations";
import { getItemInclusions } from "$lib/server/items";
import { ItemEvent } from "$lib/events";
import { logger } from "$lib/server/logger";
import z from "zod";
import { getActiveMembership } from "$lib/server/group-membership";

// Claim an item on a list
export const PUT: RequestHandler = async ({ locals, request, params }) => {
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
            quantity: true,
            claims: {
                select: {
                    quantity: true
                }
            }
        },
        where: {
            id: itemId,
            archived: false,
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

    try {
        const count = await client.$executeRaw`
            INSERT INTO list_item_claim (id, itemId, listId, claimedById, publicClaimedById, quantity, purchased)
            SELECT ${crypto.randomUUID()}, i.id, ${list.id}, ${updateData.data.claimedById ?? null},
                   ${updateData.data.publicClaimedById ?? null}, ${updateData.data.quantity}, false
            FROM items i
            WHERE i.id = ${item.id} AND i.archived = false
              AND EXISTS (SELECT 1 FROM list_item li WHERE li.itemId = i.id AND li.listId = ${list.id})
              AND (i.quantity IS NULL OR i.quantity >= ${updateData.data.quantity} +
                   COALESCE((SELECT SUM(c.quantity) FROM list_item_claim c WHERE c.itemId = i.id), 0))
        `;
        if (!count) error(409, "Wish is unavailable");
        const updatedItem = await client.item.findFirst({
            where: {
                id: item.id,
                archived: false
            },
            include: getItemInclusions()
        });
        if (updatedItem) itemEmitter.emit(ItemEvent.ITEM_UPDATE, updatedItem);

        return new Response(null, { status: 200 });
    } catch (err) {
        logger.error({ err }, "Error claiming item");
        error(422, $t("general.oops"));
    }
};
