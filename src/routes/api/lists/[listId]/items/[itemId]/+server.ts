import { getFormatter } from "$lib/i18n";
import { itemEmitter } from "$lib/server/events/emitters";
import { client } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { listItemUpdateSchema } from "$lib/validations";
import { getItemInclusions } from "$lib/server/items";
import { ItemEvent } from "$lib/events";

// Approve an item on a list
export const PATCH: RequestHandler = async ({ locals, request, params }) => {
    const $t = await getFormatter();
    if (!locals.user) error(401, $t("errors.unauthenticated"));

    const list = await client.list.findUnique({
        select: {
            ownerId: true
        },
        where: {
            id: params.listId
        }
    });
    if (!list) {
        error(404, $t("errors.list-not-found"));
    } else if (list.ownerId !== locals.user.id) {
        error(401, $t("errors.not-authorized"));
    }
    if (isNaN(parseInt(params.itemId))) {
        error(400, $t("errors.item-id-must-be-a-number"));
    }

    const body = (await request.json()) as Record<string, unknown>[];
    const updateData = listItemUpdateSchema.safeParse(body);

    if (updateData.error) {
        error(422, JSON.stringify(updateData.error.format()));
    }

    try {
        if (updateData.data.approved !== null && updateData.data.approved !== undefined) {
            await client.listItem.update({
                where: {
                    listId_itemId: {
                        listId: params.listId,
                        itemId: parseInt(params.itemId)
                    }
                },
                data: {
                    approved: updateData.data.approved
                }
            });

            const item = await client.item.findUnique({
                where: {
                    id: parseInt(params.itemId)
                },
                include: getItemInclusions(params.listId)
            });
            if (item) itemEmitter.emit(ItemEvent.ITEM_UPDATE, item);
        }

        return new Response(null, { status: 200 });
    } catch (e) {
        console.log("Error patching list item", e);
        error(404, $t("errors.item-not-found"));
    }
};

// Delete an item on a list
export const DELETE: RequestHandler = async ({ locals, params }) => {
    const $t = await getFormatter();
    if (!locals.user) error(401, $t("errors.unauthenticated"));

    if (isNaN(parseInt(params.itemId))) {
        error(400, $t("errors.item-id-must-be-a-number"));
    }

    const [list, item, listItem] = await Promise.all([
        client.list.findUnique({
            select: {
                ownerId: true
            },
            where: {
                id: params.listId
            }
        }),
        client.item.findUnique({
            select: {
                id: true,
                userId: true,
                createdById: true,
                lists: {
                    select: {
                        id: true
                    }
                }
            },
            where: {
                id: parseInt(params.itemId)
            }
        }),
        client.listItem.findUnique({
            select: {
                id: true,
                addedById: true
            },
            where: {
                listId_itemId: {
                    listId: params.listId,
                    itemId: parseInt(params.itemId)
                }
            }
        })
    ]);

    if (!listItem) {
        error(404, $t("errors.item-not-found-on-list"));
    }
    if (!list) {
        error(404, $t("errors.list-not-found"));
    }
    if (!item) {
        error(404, $t("errors.item-not-found"));
    }

    if (listItem.addedById !== locals.user.id && list.ownerId !== locals.user.id) {
        error(401, $t("errors.not-authorized"));
    }

    try {
        await client.listItem.delete({
            where: {
                id: listItem.id
            }
        });
        // Item was only on this list, we should delete it
        if (item.lists.length === 1 && (item.createdById === locals.user.id || item.userId === locals.user.id)) {
            await client.item.delete({
                where: {
                    id: item.id
                }
            });
        }

        itemEmitter.emit(ItemEvent.ITEM_DELETE, { id: parseInt(params.itemId), lists: [{ id: params.listId }] });

        return new Response(null, { status: 200 });
    } catch (e) {
        console.log("Error deleting list item", e);
        error(404, $t("errors.item-not-found"));
    }
};
