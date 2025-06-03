import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";
import { createImage, tryDeleteImage } from "$lib/server/image-util";
import { itemEmitter } from "$lib/server/events/emitters";
import { getMinorUnits } from "$lib/price-formatter";
import { getFormatter } from "$lib/server/i18n";
import { ItemEvent } from "$lib/events";
import { getItemInclusions } from "$lib/server/items";
import { getAvailableLists } from "$lib/server/list";
import { requireLogin } from "$lib/server/auth";
import { extractFormData, getItemFormSchema } from "$lib/server/validations";

export const load: PageServerLoad = async ({ params }) => {
    const user = requireLogin();

    const $t = await getFormatter();
    if (isNaN(parseInt(params.itemId))) {
        error(400, $t("errors.item-id-must-be-a-number"));
    }

    const activeMembership = await getActiveMembership(user);
    const config = await getConfig(activeMembership.groupId);

    const item = await client.item.findUnique({
        where: {
            id: parseInt(params.itemId),
            lists: {
                some: {
                    list: {
                        groupId: activeMembership.groupId
                    }
                }
            }
        },
        include: {
            itemPrice: true,
            lists: {
                select: {
                    addedById: true,
                    list: {
                        select: {
                            id: true,
                            ownerId: true
                        }
                    }
                }
            }
        }
    });

    if (!item) error(404, $t("errors.item-not-found"));

    if (config.suggestions.method === "surprise" && user.id !== item.createdById) {
        error(401, $t("errors.cannot-edit-item-that-you-did-not-create"));
    }

    if (user.id !== item.userId && user.id !== item.createdById) {
        error(400, $t("errors.item-invalid-ownership", { values: { username: user.username } }));
    }

    const lists = await getAvailableLists(item.userId, user.id);

    return {
        item: {
            ...item,
            lists: item.lists.map(({ list, addedById }) => ({
                id: list.id,
                canModify: list.ownerId === user.id || addedById === user.id
            }))
        },
        lists
    };
};

export const actions: Actions = {
    default: async ({ request, params, url: requestUrl }) => {
        const user = requireLogin();

        const itemFormSchema = await getItemFormSchema();
        const form = await request.formData().then(extractFormData).then(itemFormSchema.safeParse);

        if (!form.success) {
            form.error.format();
            return fail(400, { errors: form.error.format() });
        }
        const { url, imageUrl, image, name, price, currency, quantity, note, lists } = form.data;

        const filename = await createImage(user.username, image);

        const item = await client.item.findUniqueOrThrow({
            include: {
                lists: {
                    select: {
                        id: true,
                        addedById: true,
                        list: {
                            select: {
                                id: true,
                                ownerId: true
                            }
                        }
                    }
                }
            },
            where: {
                id: parseInt(params.itemId)
            }
        });

        let itemPriceId = null;
        if (price && currency) {
            await client.itemPrice
                .create({
                    data: {
                        value: getMinorUnits(parseFloat(price), currency),
                        currency
                    }
                })
                .then((itemPrice) => (itemPriceId = itemPrice.id));
        }

        const desiredLists = await client.list.findMany({
            select: {
                id: true,
                ownerId: true,
                groupId: true
            },
            where: {
                id: {
                    in: lists
                }
            }
        });

        const desiredListIds = new Set(desiredLists.map(({ id }) => id));
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
                        approved: l.ownerId === user.id || config.suggestions.method !== "approval"
                    };
                })
        );

        const updatedItem = await client.item.update({
            where: {
                id: parseInt(params.itemId)
            },
            data: {
                name,
                url,
                imageUrl: filename || imageUrl,
                note,
                itemPriceId,
                quantity,
                lists: {
                    create: listItemsToCreate,
                    deleteMany: {
                        id: {
                            in: listItemsToDelete
                        }
                    }
                }
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

        if (filename && item.imageUrl && item.imageUrl !== filename) {
            await tryDeleteImage(item.imageUrl);
        }

        const redirectTo = requestUrl.searchParams.get("redirectTo");
        redirect(302, redirectTo || "/");
    }
};
