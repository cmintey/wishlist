import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";
import { createImage, isValidImage, tryDeleteImage } from "$lib/server/image-util";
import { itemEmitter } from "$lib/server/events/emitters";
import { getMinorUnits } from "$lib/price-formatter";
import { getFormatter, getLocale } from "$lib/server/i18n";
import { ItemEvent } from "$lib/events";
import { getItemInclusions } from "$lib/server/items";
import { getAvailableLists, getNextDisplayOrderForLists } from "$lib/server/list";
import { requireLogin } from "$lib/server/auth";
import { extractFormData, getItemUpdateSchema } from "$lib/server/validations";
import z from "zod";
import type { List, Prisma } from "$lib/generated/prisma/client";
import { userCanEditOnSomeList } from "$lib/item-util";

export const load: PageServerLoad = async ({ params }) => {
    const user = requireLogin();

    const $t = await getFormatter();
    if (isNaN(parseInt(params.itemId))) {
        error(400, $t("errors.item-id-must-be-a-number"));
    }

    const item = await client.item.findUnique({
        where: {
            id: parseInt(params.itemId)
        },
        include: {
            itemPrice: true,
            user: {
                select: {
                    id: true,
                    name: true
                }
            },
            lists: {
                select: {
                    addedById: true,
                    list: {
                        select: {
                            id: true,
                            ownerId: true,
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

    if (!item) error(404, $t("errors.item-not-found"));

    if (!userCanEditOnSomeList(item, user.id)) {
        error(403, $t("errors.user-is-not-allowed-to-edit-this-item"));
    }

    const lists = await getAvailableLists(item.userId, user.id);

    return {
        user,
        item: {
            ...item,
            lists: item.lists.map(({ list, addedById }) => ({
                id: list.id,
                canModify:
                    list.ownerId === user.id ||
                    addedById === user.id ||
                    list.managers.find(({ userId }) => userId === user.id) !== undefined
            }))
        },
        lists
    };
};

export const actions: Actions = {
    default: async ({ request, params, url: requestUrl }) => {
        const user = requireLogin();
        const $t = await getFormatter();

        const itemFormSchema = await getItemUpdateSchema();
        const form = await request.formData().then(extractFormData).then(itemFormSchema.safeParse);

        if (!form.success) {
            return fail(400, { errors: z.flattenError(form.error).fieldErrors });
        }
        const { url, imageUrl, image, name, price, currency, quantity, note, lists, mostWanted } = form.data;

        const item = await client.item.findUniqueOrThrow({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                lists: {
                    select: {
                        id: true,
                        addedById: true,
                        displayOrder: true,
                        list: {
                            select: {
                                id: true,
                                ownerId: true,
                                managers: {
                                    select: {
                                        userId: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            where: {
                id: parseInt(params.itemId)
            }
        });

        if (!userCanEditOnSomeList(item, user.id)) {
            return fail(403, $t("errors.user-is-not-allowed-to-edit-this-item"));
        }

        let newImageFile: string | undefined | null;
        if (image && isValidImage(image)) {
            newImageFile = await createImage(name, image);
        } else if (imageUrl && item.imageUrl !== imageUrl) {
            newImageFile = await createImage(name, imageUrl);
        }

        let itemPriceId = null;
        if (price && currency) {
            await client.itemPrice
                .create({
                    data: {
                        value: getMinorUnits(parseFloat(price), currency, getLocale()),
                        currency
                    }
                })
                .then((itemPrice) => (itemPriceId = itemPrice.id));
        }

        const listsToUpdate: Prisma.ListItemUpdateManyWithoutItemNestedInput | undefined | null =
            await determineListsForUpdate(user, item, lists, mostWanted);
        if (listsToUpdate === null) {
            return fail(400, { errors: { lists: [$t("errors.an-item-must-be-added-to-at-least-one-list")] } });
        }

        const updatedItem = await client.item.update({
            where: {
                id: parseInt(params.itemId)
            },
            data: {
                name,
                url,
                imageUrl: newImageFile,
                note,
                itemPriceId,
                quantity,
                mostWanted,
                lists: listsToUpdate
            },
            include: getItemInclusions()
        });

        if (item.itemPriceId !== null && item.itemPriceId !== itemPriceId) {
            await client.itemPrice.delete({
                where: {
                    id: item.itemPriceId
                }
            });
        }

        itemEmitter.emit(ItemEvent.ITEM_UPDATE, updatedItem);

        // if the image is not undefined, then it either was just created or it's null, which indicates the user removed it
        if (newImageFile !== undefined && item.imageUrl) {
            await tryDeleteImage(item.imageUrl);
        }

        const redirectTo = requestUrl.searchParams.get("redirectTo");
        redirect(302, redirectTo || "/");
    }
};

interface PartialList extends Pick<List, "id" | "groupId" | "ownerId"> {
    managers: { userId: string }[];
}

const determineApprovalStatus = (config: Config, list: PartialList, user: LocalUser) => {
    if (list.ownerId === user.id || config.suggestions.method !== "approval") {
        return true;
    }

    return list.managers.some(({ userId }) => userId === user.id);
};

interface ItemForListDetermination {
    id: number;
    createdById: string;
    mostWanted: boolean;
    lists: {
        id: string;
        addedById: string;
        list: {
            id: string;
            ownerId: string;
        };
    }[];
}
const determineListsForUpdate = async (
    user: LocalUser,
    item: ItemForListDetermination,
    lists: string[] | undefined,
    mostWanted: boolean
) => {
    // User who did not create the item cannot update the lists
    if (item.createdById !== user.id) {
        return undefined;
    }
    if (lists === undefined) {
        return null;
    }

    const desiredLists = await client.list.findMany({
        select: {
            id: true,
            ownerId: true,
            groupId: true,
            managers: {
                select: {
                    userId: true
                }
            }
        },
        where: {
            id: {
                in: lists
            }
        }
    });

    const desiredListIds = new Set(desiredLists.map(({ id }) => id));

    const nextDisplayOrderByList = await getNextDisplayOrderForLists([...desiredListIds], mostWanted);

    const listItemsToDelete = item.lists
        // only the list owner or the person who added the item can remove it from the list
        .filter(
            (listItem) =>
                !desiredListIds.has(listItem.list.id) &&
                (listItem.addedById === user.id || listItem.list.ownerId === user.id)
        )
        .map(({ id }) => id);

    const listItemsToCreate = await Promise.all(
        desiredLists
            // only create list items which are not already existing
            .filter((l) => item.lists.find(({ list }) => list.id === l.id) === undefined)
            .map(async (l) => {
                const config = await getConfig(l.groupId);
                return {
                    listId: l.id,
                    addedById: user.id,
                    approved: determineApprovalStatus(config, l, user),
                    displayOrder: nextDisplayOrderByList[l.id] || 0
                };
            })
    );

    let listItemsToUpdate: Prisma.ListItemUpdateWithWhereUniqueWithoutItemInput[] | undefined = undefined;
    // If item is newly most wanted, then update existing lists
    if (!item.mostWanted && mostWanted) {
        listItemsToUpdate = desiredLists
            // existing lists only
            .filter((l) => item.lists.find(({ list }) => list.id === l.id) !== undefined)
            .map((list) => ({
                data: {
                    displayOrder: -1
                },
                where: {
                    listId_itemId: {
                        itemId: item.id,
                        listId: list.id
                    }
                }
            }));
    }
    return {
        create: listItemsToCreate,
        update: listItemsToUpdate,
        deleteMany: {
            id: {
                in: listItemsToDelete
            }
        }
    } satisfies Prisma.ListItemUpdateManyWithoutItemNestedInput;
};
