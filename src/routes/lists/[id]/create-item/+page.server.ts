import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";
import { createImage, isValidImage } from "$lib/server/image-util";
import { itemEmitter } from "$lib/server/events/emitters";
import { getMinorUnits } from "$lib/price-formatter";
import { getFormatter, getLocale } from "$lib/server/i18n";
import { getAvailableLists, getById } from "$lib/server/list";
import { ItemEvent } from "$lib/events";
import { getItemInclusions } from "$lib/server/items";
import { requireLogin } from "$lib/server/auth";
import { extractFormData, getItemCreateSchema } from "$lib/server/validations";

export const load: PageServerLoad = async ({ params }) => {
    const user = requireLogin();
    const $t = await getFormatter();

    const activeMembership = await getActiveMembership(user);
    const list = await getById(params.id);
    if (!list) {
        error(404, $t("errors.list-not-found"));
    }
    if (!list.public && list.groupId !== activeMembership.groupId) {
        error(404, $t("errors.user-not-in-group"));
    }

    const config = await getConfig(activeMembership.groupId);

    if (!config.suggestions.enable && user.id !== list.owner.id) {
        error(401, $t("errors.suggestions-are-disabled"));
    }

    const lists = await getAvailableLists(list.owner.id, user.id);

    return {
        lists,
        list: {
            id: list.id,
            owner: {
                name: list.owner.name,
                isMe: list.owner.id === user.id
            }
        },
        suggestion: list.owner.id !== user.id,
        suggestionMethod: config.suggestions.method
    };
};

export const actions: Actions = {
    default: async ({ request, params, url: requestUrl }) => {
        const user = requireLogin();
        const $t = await getFormatter();

        const activeMembership = await getActiveMembership(user);

        const list = await getById(params.id);
        if (!list) {
            return fail(404, { success: false, message: $t("errors.list-not-found") });
        }
        if (!list.public && list.groupId !== activeMembership.groupId) {
            return fail(404, { success: false, message: $t("errors.user-not-in-group") });
        }

        const itemFormSchema = await getItemCreateSchema();
        const form = await request.formData().then(extractFormData).then(itemFormSchema.safeParse);

        if (!form.success) {
            form.error.format();
            return fail(400, { errors: form.error.format() });
        }
        const { url, imageUrl, image, name, price, currency, quantity, note, lists: listIds } = form.data;

        let newImageFile: string | undefined | null;
        if (image && isValidImage(image)) {
            newImageFile = await createImage(name, image);
        } else if (imageUrl) {
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
                    addedById: user.id,
                    approved: l.ownerId === user.id || config.suggestions.method !== "approval"
                };
            })
        );

        const item = await client.item.create({
            data: {
                userId: list.owner.id,
                name,
                url,
                note,
                imageUrl: newImageFile,
                createdById: user.id,
                itemPriceId,
                quantity,
                lists: {
                    create: listItems
                }
            },
            include: getItemInclusions()
        });

        itemEmitter.emit(ItemEvent.ITEM_CREATE, item);

        const redirectTo = requestUrl.searchParams.get("redirectTo");
        redirect(302, redirectTo || "/");
    }
};
