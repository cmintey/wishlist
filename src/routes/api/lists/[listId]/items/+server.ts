import { getFormatter } from "$lib/server/i18n";
import { itemEmitter } from "$lib/server/events/emitters";
import { client } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { listItemsUpdateSchema } from "$lib/server/validations";
import { ItemEvent } from "$lib/events";
import { requireLoginOrError } from "$lib/server/auth";
import { logger } from "$lib/server/logger";

export const PATCH: RequestHandler = async ({ request, params }) => {
    await requireLoginOrError();
    const $t = await getFormatter();

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
    } catch (err) {
        logger.error({ err }, "Error patching list items");
        error(404, $t("errors.item-not-found"));
    }
};
