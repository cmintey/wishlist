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
import type { ItemClaimModel, ItemModel } from "$lib/generated/prisma/models";

// Unclaim an item on a list
export const DELETE: RequestHandler = async ({ params }) => {
    const user = await requireLoginOrError();
    const claim = await findClaim(params.claimId, user);

    return deleteClaim(claim);
};

// Update a claim -- set or unset purchased
export const PATCH: RequestHandler = async ({ request, params }) => {
    const user = await requireLoginOrError();
    const $t = await getFormatter();

    const claim = await findClaim(params.claimId, user);
    const updateData = await request.json().then((d) => listItemClaimUpdateSchema.safeParse(d));

    if (updateData.error) {
        error(422, JSON.stringify(z.flattenError(updateData.error).fieldErrors));
    }

    try {
        if (updateData.data?.quantity === 0) {
            return deleteClaim(claim);
        }

        if (
            (updateData.data.purchased !== null && updateData.data.purchased !== undefined) ||
            updateData.data.quantity
        ) {
            const result = await client.itemClaim.updateMany({
                data: {
                    purchased:
                        updateData.data.purchased !== null && updateData.data.purchased !== undefined
                            ? updateData.data.purchased
                            : undefined,
                    quantity: updateData.data.quantity ?? undefined
                },
                where: {
                    id: claim.id,
                    item: { archived: false }
                }
            });
            if (!result.count) error(409, "Wish is unavailable");
            const updatedItem = await client.item.findFirst({
                where: {
                    id: claim.item.id,
                    archived: false
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

interface ItemClaim extends Pick<ItemClaimModel, "id" | "claimedById" | "publicClaimedById"> {
    item: Pick<ItemModel, "id" | "userId">;
}

async function findClaim(claimId: string, user: LocalUser): Promise<ItemClaim> {
    const $t = await getFormatter();

    const claim = await client.itemClaim.findUnique({
        select: {
            id: true,
            claimedById: true,
            publicClaimedById: true,
            item: {
                select: {
                    id: true,
                    userId: true
                }
            }
        },
        where: {
            id: claimId,
            item: { archived: false }
        }
    });

    if (!claim) {
        error(404, $t("errors.claim-was-not-found"));
    }

    // Item owners and claimers can update claims
    if (claim.claimedById !== user.id && user.id !== claim.item.userId) {
        error(403, $t("errors.cannot-update-a-claim-that-is-not-yours"));
    }

    return claim;
}

async function deleteClaim(claim: ItemClaim) {
    const $t = await getFormatter();

    try {
        const deleted = await client.itemClaim.deleteMany({
            where: {
                id: claim.id,
                item: { archived: false }
            }
        });
        if (!deleted.count) error(409, "Wish is unavailable");

        const item = await client.item.findFirst({
            where: {
                id: claim.item.id,
                archived: false
            },
            include: getItemInclusions()
        });
        if (item) itemEmitter.emit(ItemEvent.ITEM_UPDATE, item);

        return new Response();
    } catch (err) {
        logger.error({ err }, "Unable to unclaim item");
        error(500, $t("errors.unable-to-unclaim-item"));
    }
}
