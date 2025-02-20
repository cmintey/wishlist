import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";
import { createImage } from "$lib/server/image-util";
import { itemEmitter } from "$lib/server/events/emitters";
import { getMinorUnits } from "$lib/price-formatter";
import { getFormatter } from "$lib/i18n";
import { getById } from "$lib/server/list";
import { ItemEvent } from "$lib/events";
import { getItemInclusions } from "$lib/server/items";

export const load: PageServerLoad = async ({ locals, params, url }) => {
    const $t = await getFormatter();

    if (!locals.user) {
        redirect(302, `/login?ref=${url.pathname + url.search}`);
    }

    const activeMembership = await getActiveMembership(locals.user);
    const list = await getById(params.id);
    if (!list) {
        error(404, $t("errors.list-not-found"));
    }
    if (list.groupId !== activeMembership.groupId) {
        error(404, $t("errors.user-not-in-group"));
    }

    const config = await getConfig(activeMembership.groupId);

    if (!config.suggestions.enable && locals.user.id !== list.owner.id) {
        error(401, $t("errors.suggestions-are-disabled"));
    }

    const lists = await client.userGroupMembership
        .findMany({
            select: {
                groupId: true
            },
            where: {
                userId: locals.user.id
            }
        })
        .then((groups) =>
            client.list.findMany({
                select: {
                    id: true,
                    name: true,
                    public: true,
                    owner: {
                        select: {
                            name: true
                        }
                    },
                    group: {
                        select: {
                            name: true
                        }
                    }
                },
                where: {
                    ownerId: list.owner.id,
                    groupId: {
                        in: groups.map((g) => g.groupId)
                    }
                }
            })
        );

    return {
        list: {
            id: list.id,
            owner: {
                name: list.owner.name,
                isMe: list.owner.id === locals.user.id
            }
        },
        lists,
        suggestion: list.owner.id !== locals.user.id,
        suggestionMethod: config.suggestions.method
    };
};

export const actions: Actions = {
    default: async ({ request, locals, params }) => {
        const $t = await getFormatter();

        if (!locals.user) {
            return fail(401, { success: false, message: $t("errors.unauthenticated") });
        }

        const activeMembership = await getActiveMembership(locals.user);

        const list = await getById(params.id);
        if (!list) {
            return fail(404, { success: false, message: $t("errors.list-not-found") });
        }
        if (list.groupId !== activeMembership.groupId) {
            return fail(404, { success: false, message: $t("errors.user-not-in-group") });
        }

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

        const lists = await client.list.findMany({
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

        const listItems = await Promise.all(
            lists.map(async (l) => {
                const config = await getConfig(l.groupId);
                return {
                    listId: l.id,
                    addedById: locals.user!.id,
                    approved: l.ownerId === locals.user!.id || config.suggestions.method !== "approval"
                };
            })
        );

        const item = await client.item.create({
            data: {
                userId: list.owner.id,
                name,
                url,
                note,
                imageUrl: filename || imageUrl,
                createdById: locals.user.id,
                itemPriceId,
                lists: {
                    create: listItems
                }
            },
            include: getItemInclusions()
        });

        itemEmitter.emit(ItemEvent.ITEM_CREATE, item);

        const ref = new URL(request.url).searchParams.get("ref");
        redirect(302, ref || "/");
    }
};
