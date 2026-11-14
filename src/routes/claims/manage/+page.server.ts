import { toItemOnListDTO } from "$lib/dtos/item-mapper";
import { getConfig } from "$lib/server/config";
import { getFormatter } from "$lib/server/i18n";
import { getItemInclusions } from "$lib/server/items";
import { client } from "$lib/server/prisma";
import { publicClaimByToken } from "$lib/server/public-claims";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, setHeaders }) => {
    setHeaders({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" });

    const $t = await getFormatter();
    const token = url.searchParams.get("token");
    if (!token) {
        error(404, $t("errors.claim-was-not-found"));
    }

    const itemInclusions = getItemInclusions();
    const claim = await client.itemClaim.findFirst({
        select: {
            id: true,
            quantity: true,
            item: {
                include: {
                    ...itemInclusions,
                    claims: { ...itemInclusions.claims, where: publicClaimByToken(token) }
                }
            },
            list: { select: { id: true, name: true, groupId: true, public: true } }
        },
        where: publicClaimByToken(token)
    });

    if (!claim) {
        error(404, $t("errors.claim-was-not-found"));
    }

    const config = await getConfig(claim.list.groupId);
    return {
        claimId: claim.id,
        quantity: claim.quantity,
        item: toItemOnListDTO(claim.item, claim.list.id),
        listName: claim.list.name ?? $t("wishes.a-wishlist"),
        listPublic: claim.list.public,
        groupId: claim.list.groupId,
        requireClaimEmail: config.claims.requireEmail
    };
};
