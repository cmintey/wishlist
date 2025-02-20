import { getFormatter } from "$lib/i18n";
import { itemEmitter } from "$lib/server/events/emitters";
import { client } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { listItemsUpdateSchema } from "$lib/validations";
import { ItemEvent } from "$lib/events";

export const PATCH: RequestHandler = async ({ locals, request, params }) => {
    const $t = await getFormatter();
    if (!locals.user) error(401, $t("errors.unauthenticated"));

    const body = (await request.json()) as Record<string, unknown>[];
    const updateData = listItemsUpdateSchema.array().safeParse(body);

    if (updateData.error) {
        error(422, $t("errors.one-or-more-items-missing-an-id"));
    }

    try {
        await client.$transaction(
            updateData.data.map((d) => {
                return client.listItem.update({
                    where: {
                        listId_itemId: {
                            listId: params.listId,
                            itemId: d.itemId
                        }
                    },
                    data: {
                        displayOrder: d.displayOrder
                    }
                });
            })
        );

        itemEmitter.emit(ItemEvent.ITEMS_UPDATE);

        return new Response(null, { status: 200 });
    } catch (e) {
        console.log("Error patching list items", e);
        error(404, $t("errors.item-not-found"));
    }
};
