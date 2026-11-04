import { ItemEvent } from "$lib/events";
import { itemEmitter } from "$lib/server/events/emitters";
import { getFormatter } from "$lib/server/i18n";
import { getItemInclusions } from "$lib/server/items";
import { logger } from "$lib/server/logger";
import { client } from "$lib/server/prisma";
import { publicClaimByToken } from "$lib/server/public-claims";
import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

const claimSelect = {
    id: true,
    quantity: true,
    itemId: true,
    item: {
        select: {
            name: true,
            imageUrl: true
        }
    },
    list: {
        select: {
            id: true,
            name: true,
            public: true
        }
    },
    publicClaimedBy: {
        select: {
            name: true
        }
    }
};

// Mirrors ItemImage.svelte: an absolute URL is used as-is, anything else is an
// upload id served by /api/assets
const toImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return undefined;
    try {
        return new URL(imageUrl).href;
    } catch {
        if (imageUrl.startsWith("/") || imageUrl.endsWith("/")) return undefined;
        return `/api/assets/${imageUrl}`;
    }
};

// Public claimers have no account, so the tokenized link from their confirmation
// email is the only thing that authorizes them to manage the claim
const findClaimByToken = async (token: string | null) => {
    if (!token) return null;

    return await client.itemClaim.findFirst({
        select: claimSelect,
        where: publicClaimByToken(token)
    });
};

export const load: PageServerLoad = async ({ url }) => {
    const $t = await getFormatter();
    const claim = await findClaimByToken(url.searchParams.get("token"));

    if (!claim) {
        error(404, $t("errors.claim-was-not-found"));
    }

    return {
        itemName: claim.item.name,
        itemImageUrl: toImageUrl(claim.item.imageUrl),
        listId: claim.list.id,
        listName: claim.list.name,
        quantity: claim.quantity
    };
};

export const actions: Actions = {
    unclaim: async ({ request, url }) => {
        const $t = await getFormatter();
        const formData = await request.formData();
        const claim = await findClaimByToken(formData.get("token")?.toString() ?? url.searchParams.get("token"));

        if (!claim) {
            return fail(404, { error: true, message: $t("errors.claim-was-not-found") });
        }

        try {
            await client.itemClaim.delete({
                where: {
                    id: claim.id
                }
            });
        } catch (err) {
            logger.error({ err }, "Unable to unclaim item using claim token");
            return fail(500, { error: true, message: $t("errors.unable-to-unclaim-item") });
        }

        const item = await client.item.findUnique({
            where: {
                id: claim.itemId
            },
            include: getItemInclusions()
        });
        if (item) itemEmitter.emit(ItemEvent.ITEM_UPDATE, item);

        return { success: true, itemName: claim.item.name };
    }
};
