import { ItemEvent } from "$lib/events";
import { itemEmitter } from "$lib/server/events/emitters";
import { getFormatter } from "$lib/server/i18n";
import { getItemInclusions } from "$lib/server/items";
import { logger } from "$lib/server/logger";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import z from "zod";

const publicUnclaimSchema = z.object({
    claimId: z.uuid(),
    publicClaimedById: z.string().min(1)
});

// Release a claim made without an account, from the browser that made it.
// Knowing the claim's SystemUser id is what authorizes this: it is generated
// per claim and only returned to the claimer. Claims belonging to a registered
// user are never matched here, so this cannot touch them.
export const DELETE: RequestHandler = async ({ request }) => {
    const $t = await getFormatter();

    const body = await request.json().then((d) => publicUnclaimSchema.safeParse(d));
    if (body.error) {
        error(422, JSON.stringify(z.flattenError(body.error).fieldErrors));
    }

    const claim = await client.itemClaim.findFirst({
        select: {
            id: true,
            itemId: true,
            list: {
                select: {
                    public: true
                }
            }
        },
        where: {
            id: body.data.claimId,
            publicClaimedById: body.data.publicClaimedById
        }
    });

    if (!claim || !claim.list.public) {
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
