import { getFormatter } from "$lib/server/i18n";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { client } from "$lib/server/prisma";
import { itemEmitter } from "$lib/server/events/emitters";
import { getItemInclusions } from "$lib/server/items";
import { listItemClaimUpdateSchema } from "$lib/server/validations";
import { ItemEvent } from "$lib/events";
import { requireLoginOrError } from "$lib/server/auth";
import { logger } from "$lib/server/logger";
import z from "zod";

// Unclaim an item on a list
export const DELETE: RequestHandler = async ({ params }) => {
    const user = await requireLoginOrError();
    return deleteClaim(params.claimId, user);
};

// Update a claim -- set or unset purchased
export const PATCH: RequestHandler = async ({ request, params }) => {
    const user = await requireLoginOrError();
    const $t = await getFormatter();

    const claim = await client.itemClaim.findUnique({
        select: {
            id: true,
            itemId: true,
            claimedById: true,
            publicClaimedById: true
        },
        where: {
            id: params.claimId
        }
    });

    if (!claim) {
        error(404, $t("errors.claim-was-not-found"));
    }

    if (claim.claimedById && claim.claimedById !== user.id) {
        error(401, $t("errors.cannot-update-a-claim-that-is-not-yours"));
    }

    const updateData = await request.json().then((d) => listItemClaimUpdateSchema.safeParse(d));

    if (updateData.error) {
        error(422, JSON.stringify(z.flattenError(updateData.error).fieldErrors));
    }

    try {
        if (updateData.data?.quantity === 0) {
            return deleteClaim(claim.id, user);
        }

        if (
            (updateData.data.purchased !== null && updateData.data.purchased !== undefined) ||
            updateData.data.quantity
        ) {
            await client.itemClaim.update({
                data: {
                    purchased:
                        updateData.data.purchased !== null && updateData.data.purchased !== undefined
                            ? updateData.data.purchased
                            : undefined,
                    quantity: updateData.data.quantity ?? undefined
                },
                where: {
                    id: claim.id
                }
            });
            const updatedItem = await client.item.findUnique({
                where: {
                    id: claim.itemId
                },
                include: getItemInclusions()
            });
            if (updatedItem) itemEmitter.emit(ItemEvent.ITEM_UPDATE, updatedItem);
        }
        return new Response();
    } catch (err) {
        logger.error({ err }, "Unable to update claim");
        error(500, $t("errors.unable-to-update-claim"));
    }
};

async function deleteClaim(id: string, user: LocalUser) {
    const $t = await getFormatter();

    const claim = await client.itemClaim.findUnique({
        select: {
            id: true,
            itemId: true,
            listId: true,
            claimedById: true,
            publicClaimedById: true
        },
        where: {
            id
        }
    });

    if (!claim) {
        error(404, $t("errors.claim-was-not-found"));
    }

    if (claim.claimedById && claim.claimedById !== user.id) {
        error(401, $t("errors.cannot-unclaim-an-item-you-did-not-claim"));
    }

    try {
        await client.itemClaim.delete({
            where: {
                id: claim.id
            }
        });

        // When unclaiming, also unarchive the item
        const item = await client.item.update({
            where: {
                id: claim.itemId
            },
            data: {
                archivedById: null
            },
            include: getItemInclusions()
        });
        if (item) itemEmitter.emit(ItemEvent.ITEM_UPDATE, item);

        return new Response();
    } catch (err) {
        logger.error({ err }, "Unable to claim item");
        error(500, $t("errors.unable-to-unclaim-item"));
    }
}
