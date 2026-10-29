import { ItemEvent } from "$lib/events";
import { itemEmitter } from "$lib/server/events/emitters";
import { getFormatter } from "$lib/server/i18n";
import { getItemInclusions } from "$lib/server/items";
import { logger } from "$lib/server/logger";
import { client } from "$lib/server/prisma";
import { publicClaimByToken } from "$lib/server/public-claims";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import z from "zod";

const publicUnclaimSchema = z.object({
    token: z.string().min(1)
});

// Release a claim made without an account, from the browser that made it.
// The claim's token is what authorizes this: it is returned only in the
// response to the claim request, never with the list's items.
export const DELETE: RequestHandler = async ({ request }) => {
    const $t = await getFormatter();

    const body = await request
        .json()
        .catch(() => undefined)
        .then((d) => publicUnclaimSchema.safeParse(d));
    if (body.error) {
        error(422, JSON.stringify(z.flattenError(body.error).fieldErrors));
    }

    const claim = await client.itemClaim.findFirst({
        select: {
            id: true,
            itemId: true
        },
        where: publicClaimByToken(body.data.token)
    });

    if (!claim) {
        error(404, $t("errors.claim-was-not-found"));
    }

    try {
        await client.itemClaim.delete({
            where: {
                id: claim.id
            }
        });
    } catch (err) {
        logger.error({ err }, "Unable to unclaim item");
        error(500, $t("errors.unable-to-unclaim-item"));
    }

    const item = await client.item.findUnique({
        where: {
            id: claim.itemId
        },
        include: getItemInclusions()
    });
    if (item) itemEmitter.emit(ItemEvent.ITEM_UPDATE, item);

    return new Response(null, { status: 200 });
};
