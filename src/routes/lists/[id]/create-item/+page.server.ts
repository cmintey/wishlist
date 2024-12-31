import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";
import { createImage } from "$lib/server/image-util";
import { SSEvents } from "$lib/schema";
import { itemEmitter } from "$lib/server/events/emitters";
import { getMinorUnits } from "$lib/price-formatter";
import { getFormatter } from "$lib/i18n";
import { getById } from "$lib/server/list";

export const load: PageServerLoad = async ({ locals, params, url }) => {
    const $t = await getFormatter();

    if (!locals.user) {
        redirect(302, `/login?ref=${url.pathname}`);
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

    if (!config.suggestions.enable && locals.user.id !== list?.owner.id) {
        error(401, $t("errors.suggestions-are-disabled"));
    }

    return {
        owner: {
            name: list.owner.name,
            isMe: list.owner.id === locals.user.id
        },
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
        const config = await getConfig(activeMembership.groupId);

        const form = await request.formData();
        const url = form.get("url") as string;
        const imageUrl = form.get("image_url") as string;
        const image = form.get("image") as File;
        const name = form.get("name") as string;
        const price = form.get("price") as string;
        const currency = form.get("currency") as string;
        const note = form.get("note") as string;

        // check for empty values
        if (!name) {
            return fail(400, { name, missing: true });
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

        const item = await client.item.create({
            data: {
                userId: list.owner.id,
                name,
                url,
                note,
                imageUrl: filename || imageUrl,
                addedById: locals.user.id,
                approved: list.owner.id === locals.user.id || config.suggestions.method !== "approval",
                groupId: activeMembership.groupId,
                itemPriceId,
                lists: {
                    connect: {
                        id: list.id
                    }
                }
            },
            include: {
                addedBy: {
                    select: {
                        username: true,
                        name: true
                    }
                },
                pledgedBy: {
                    select: {
                        username: true,
                        name: true
                    }
                },
                user: {
                    select: {
                        username: true,
                        name: true
                    }
                },
                lists: {
                    select: {
                        id: true
                    }
                },
                itemPrice: true
            }
        });

        itemEmitter.emit(SSEvents.item.create, item);

        const ref = new URL(request.url).searchParams.get("ref");
        redirect(302, ref || "/");
    }
};
