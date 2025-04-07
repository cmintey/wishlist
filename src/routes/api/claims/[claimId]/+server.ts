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

// Unclaim an item on a list
export const DELETE: RequestHandler = async ({ params }) => {
    const user = await requireLoginOrError();
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
            id: params.claimId
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

        const item = await client.item.findUnique({
            where: {
                id: claim.itemId
            },
            include: getItemInclusions()
        });
        if (item) itemEmitter.emit(ItemEvent.ITEM_UPDATE, item);

        return new Response();
    } catch (err) {
        logger.error({ err }, "Unable to claim item");
        error(500, $t("errors.unable-to-unclaim-item"));
    }
};

// Update a claim -- set or unset purchased
export const PATCH: RequestHandler = async ({ request, params }) => {
    const user = await requireLoginOrError();
    const $t = await getFormatter();

    const claim = await client.itemClaim.findUnique({
        select: {
            id: true,
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
        error(422, JSON.stringify(updateData.error.format()));
    }

    try {
        if (updateData.data.purchased !== null && updateData.data.purchased !== undefined) {
            await client.itemClaim.update({
                data: {
                    purchased: updateData.data.purchased
                },
                where: {
                    id: claim.id
                }
            });
        }
        return new Response();
    } catch (err) {
        logger.error({ err }, "Unable to update claim");
        error(500, $t("errors.unable-to-update-claim"));
    }
};
