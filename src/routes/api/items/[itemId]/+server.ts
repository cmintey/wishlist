import { getFormatter } from "$lib/server/i18n";
import { itemEmitter } from "$lib/server/events/emitters";
import { ItemEvent } from "$lib/events";
import { tryDeleteImage } from "$lib/server/image-util";
import { client } from "$lib/server/prisma";
import { error, type RequestHandler } from "@sveltejs/kit";
import { requireLoginOrError } from "$lib/server/auth";
import type { List as PrismaList, Item as PrismaItem } from "@prisma/client";

interface List extends Pick<PrismaList, "groupId"> {
    managers: string[];
}

interface Item extends Pick<PrismaItem, "id" | "createdById" | "userId"> {
    lists: List[];
}

const validateItem = async (itemId: string | undefined) => {
    const $t = await getFormatter();

    if (!itemId) {
        error(400, $t("errors.must-specify-an-item-to-delete"));
    } else if (isNaN(parseInt(itemId))) {
        error(400, $t("errors.item-id-must-be-a-number"));
    }

    const item = await client.item.findUnique({
        where: {
            id: parseInt(itemId)
        },
        select: {
            id: true,
            createdById: true,
            userId: true,
            lists: {
                select: {
                    list: {
                        select: {
                            groupId: true,
                            managers: {
                                select: {
                                    userId: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!item) {
        error(404, $t("errors.item-not-found"));
    }

    const { lists, ...rest } = item;
    return {
        ...rest,
        lists: lists.map((li) => ({
            groupId: li.list.groupId,
            managers: li.list.managers.map(({ userId }) => userId)
        }))
    };
};

const isItemOnManagedList = (item: Item, user: LocalUser) => {
    if (item.lists.length > 1 || item.lists.length === 0) {
        return false;
    }
    return item.lists[0].managers.find((userId) => user.id === userId) !== undefined;
};

export const DELETE: RequestHandler = async ({ params }) => {
    const user = await requireLoginOrError();
    const $t = await getFormatter();
    const item = await validateItem(params?.itemId);

    // item is not created by the user or for the user and
    // item is not on a list which is managed by the user
    if (user.id !== item.createdById && user.id !== item.userId && !isItemOnManagedList(item, user)) {
        error(401, $t("errors.not-authorized"));
    }

    try {
        const deletedItem = await client.item.delete({
            where: {
                id: item.id
            },
            select: {
                id: true,
                userId: true,
                lists: {
                    select: {
                        list: {
                            select: {
                                id: true
                            }
                        }
                    }
                },
                imageUrl: true
            }
        });

        const { lists, ...rest } = deletedItem;
        const itemToReturn = {
            ...rest,
            lists: lists.map((li) => ({ ...li.list }))
        };

        itemEmitter.emit(ItemEvent.ITEM_DELETE, itemToReturn);

        if (itemToReturn.imageUrl) {
            await tryDeleteImage(itemToReturn.imageUrl);
        }

        return new Response(JSON.stringify(item), { status: 200 });
    } catch {
        error(404, $t("errors.item-not-found"));
    }
};
