import { getFormatter } from "$lib/server/i18n";
import { itemEmitter } from "$lib/server/events/emitters";
import { client } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { listItemClaimSchema } from "$lib/server/validations";
import type { Prisma } from "@prisma/client";
import { getItemInclusions } from "$lib/server/items";
import { ItemEvent } from "$lib/events";

// Claim an item on a list
export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const $t = await getFormatter();

    const body = (await request.json()) as Record<string, unknown>[];
    const updateData = listItemClaimSchema.safeParse(body);

    if (updateData.error) {
        error(422, JSON.stringify(updateData.error.format()));
    }

    const list = await client.list.findUnique({
        select: {
            public: true
        },
        where: {
            id: params.listId
        }
    });

    if (!list) {
        error(404, $t("errors.list-not-found"));
    }

    if (isNaN(parseInt(params.itemId))) {
        error(400, $t("errors.item-id-must-be-a-number"));
    }

    if (updateData.data.claimedById !== undefined && updateData.data.claimedById !== null) {
        if (!locals.user) error(401, $t("errors.unauthenticated"));
    }
    if (updateData.data.publicClaimedById && !list.public) {
        error(404, $t("errors.list-not-found"));
    }

    try {
        const data: Prisma.ItemClaimCreateInput = {
            item: {
                connect: {
                    id: parseInt(params.itemId)
                }
            },
            list: {
                connect: {
                    id: params.listId
                }
            }
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
        } else {
            error(400, $t("errors.claimed-by-user-must-be-specified"));
        }

        await client.itemClaim.create({ data });
        const item = await client.item.findUnique({
            where: {
                id: parseInt(params.itemId)
            },
            include: getItemInclusions()
        });
        if (item) itemEmitter.emit(ItemEvent.ITEM_UPDATE, item);

        return new Response(null, { status: 200 });
    } catch (e) {
        console.log("Error patching list item", e);
        error(404, $t("errors.item-not-found"));
    }
};
