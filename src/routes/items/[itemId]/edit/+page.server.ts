import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";
import { createImage, tryDeleteImage } from "$lib/server/image-util";
import { itemEmitter } from "$lib/server/events/emitters";
import { getMinorUnits } from "$lib/price-formatter";
import { getFormatter } from "$lib/i18n";
import { ItemEvent } from "$lib/events";
import { getItemInclusions } from "$lib/server/items";
import { getAvailableLists } from "$lib/server/list";

export const load: PageServerLoad = async ({ locals, params }) => {
    if (!locals.user) {
        redirect(302, `/login?ref=/items/${params.itemId}/edit`);
    }

    const $t = await getFormatter();
    if (isNaN(parseInt(params.itemId))) {
        error(400, $t("errors.item-id-must-be-a-number"));
    }

    const activeMembership = await getActiveMembership(locals.user);
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

    if (config.suggestions.method === "surprise" && locals.user.id !== item.createdById) {
        error(401, $t("errors.cannot-edit-item-that-you-did-not-create"));
    }

    if (locals.user.id !== item.userId && locals.user.id !== item.createdById) {
        error(400, $t("errors.item-invalid-ownership", { values: { username: locals.user.username } }));
    }

    const lists = await getAvailableLists(item.userId, locals.user.id);

    return {
        item: {
            ...item,
            lists: item.lists.map(({ list, addedById }) => ({
                id: list.id,
                canModify: list.ownerId === locals.user!.id || addedById === locals.user!.id
            }))
        },
        lists
    };
};

export const actions: Actions = {
    default: async ({ locals, request, params }) => {
        const $t = await getFormatter();

        if (!locals.user) error(401, "Not authorized");
        const form = await request.formData();
        const url = form.get("url") as string;
        const imageUrl = form.get("image_url") as string;
        const image = form.get("image") as File;
        const name = form.get("name") as string;
        const price = form.get("price") as string;
        const currency = form.get("currency") as string;
        const note = form.get("note") as string;
        const listIds = form.getAll("list") as string[];

        // check for empty values
        if (!name || listIds.length === 0) {
            const errors: Record<string, string> = {};
            if (!name) {
                errors["name"] = $t("errors.item-name-required");
            }
            if (listIds.length === 0) {
                errors["list"] = $t("errors.an-item-must-be-added-to-at-least-one-list");
            }
            return fail(400, { errors });
        }

        const filename = await createImage(locals.user.username, image);

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
                    in: listIds
                }
            }
        });

        const desiredListIds = new Set(desiredLists.map(({ id }) => id));
        const listItemsToDelete = item.lists
            // only the list owner or the person who added the item can remove it from the list
            .filter(
                (listItem) =>
                    !desiredListIds.has(listItem.list.id) &&
                    (listItem.addedById === locals.user!.id || listItem.list.ownerId === locals.user!.id)
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
                        addedById: locals.user!.id,
                        approved: l.ownerId === locals.user!.id || config.suggestions.method !== "approval"
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

        const ref = new URL(request.url).searchParams.get("ref");
        redirect(302, ref || "/");
    }
};
