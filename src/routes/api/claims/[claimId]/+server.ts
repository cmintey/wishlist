import { getFormatter } from "$lib/i18n";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { client } from "$lib/server/prisma";
import { itemEmitter } from "$lib/server/events/emitters";
import { getItemInclusions } from "$lib/server/items";
import { listItemClaimUpdateSchema } from "$lib/validations";
import { ItemEvent } from "$lib/events";

// Unclaim an item on a list
export const DELETE: RequestHandler = async ({ locals, params }) => {
    const $t = await getFormatter();
    if (!locals.user) error(401, $t("errors.unauthenticated"));

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

    if (claim.claimedById && claim.claimedById !== locals.user.id) {
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
            include: getItemInclusions(claim.listId)
        });
        if (item) itemEmitter.emit(ItemEvent.ITEM_UPDATE, item);

        return new Response();
    } catch (e) {
        console.error(e);
        error(500, $t("errors.unable-to-unclaim-item"));
    }
};

// Update a claim -- set or unset purchased
export const PATCH: RequestHandler = async ({ request, locals, params }) => {
    const $t = await getFormatter();
    if (!locals.user) error(401, $t("errors.unauthenticated"));

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

    if (claim.claimedById && claim.claimedById !== locals.user.id) {
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
    } catch (e) {
        console.error(e);
        error(500, $t("errors.unable-to-update-claim"));
    }
};
