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

export const load: PageServerLoad = async ({ locals, params }) => {
    const $t = await getFormatter();

    if (!locals.user) {
        redirect(302, `/login?ref=/wishlists/${params.username}/new`);
    }
    const activeMembership = await getActiveMembership(locals.user);
    const config = await getConfig(activeMembership.groupId);

    if (!config.suggestions.enable && locals.user.username !== params.username) {
        error(401, $t("errors.suggestions-are-disabled"));
    }

    const listOwner = await client.user.findFirst({
        where: {
            username: params.username,
            UserGroupMembership: {
                some: {
                    group: {
                        id: activeMembership.groupId
                    }
                }
            }
        },
        select: {
            username: true,
            name: true
        }
    });

    if (!listOwner) error(404, $t("errors.user-not-in-group"));

    return {
        owner: {
            name: listOwner.name,
            isMe: listOwner.username === locals.user.username
        },
        suggestion: locals.user.username !== params.username,
        suggestionMethod: config.suggestions.method
    };
};

export const actions: Actions = {
    default: async ({ request, locals, params }) => {
        if (!locals.user) error(401);

        const activeMembership = await getActiveMembership(locals.user);
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

        const user = await client.user.findUniqueOrThrow({
            where: {
                username: params.username
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

        const item = await client.item.create({
            data: {
                userId: user.id,
                name,
                url,
                note,
                imageUrl: filename || imageUrl,
                addedById: locals.user.id,
                approved: params.username === locals.user.username || config.suggestions.method !== "approval",
                groupId: activeMembership.groupId,
                itemPriceId
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

        redirect(302, `/wishlists/${params.username}`);
    }
};
