import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";
import { createImage, tryDeleteImage } from "$lib/server/image-util";
import { itemEmitter } from "$lib/server/events/emitters";
import { SSEvents } from "$lib/schema";

export const load: PageServerLoad = async ({ locals, params }) => {
    if (!locals.user) {
        redirect(302, `/login?ref=/wishlists/${params.username}/edit/${params.itemId}`);
    }

    if (isNaN(parseInt(params.itemId))) {
        error(400, "item id must be a number");
    }

    const activeMembership = await getActiveMembership(locals.user);
    const config = await getConfig(activeMembership.groupId);

    let item;
    try {
        item = await client.item.findFirstOrThrow({
            where: {
                id: parseInt(params.itemId),
                groupId: activeMembership.groupId
            },
            include: {
                addedBy: {
                    select: {
                        username: true
                    }
                },
                user: {
                    select: {
                        username: true
                    }
                },
                itemPrice: true
            }
        });
    } catch {
        error(404, "item not found");
    }

    if (config.suggestions.method === "surprise" && locals.user.username !== item.addedBy?.username) {
        error(401, "cannot edit item that you did not create");
    }

    if (params.username !== item.user.username) {
        error(400, `Item does not belong to ${params.username}`);
    }

    return {
        item
    };
};

export const actions: Actions = {
    default: async ({ locals, request, params }) => {
        if (!locals.user) error(401, "Not authorized");
        const form = await request.formData();
        const url = form.get("url") as string;
        const imageUrl = form.get("image_url") as string;
        const image = form.get("image") as File;
        const name = form.get("name") as string;
        const price = form.get("price") as string;
        const note = form.get("note") as string;

        // check for empty values
        if (!name) {
            return fail(400, { name, missing: true });
        }

        const filename = await createImage(locals.user.username, image);

        const item = await client.item.findUniqueOrThrow({
            where: {
                id: parseInt(params.itemId)
            }
        });

        const updatedItem = await client.item.update({
            where: {
                id: parseInt(params.itemId)
            },
            data: {
                name,
                price,
                url,
                imageUrl: filename || imageUrl,
                note
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
                }
            }
        });

        itemEmitter.emit(SSEvents.item.update, updatedItem);

        if (filename && item.imageUrl && item.imageUrl !== filename) {
            await tryDeleteImage(item.imageUrl);
        }

        const ref = new URL(request.url).searchParams.get("ref");
        redirect(302, ref ?? `/wishlists/${params.username}`);
    }
};
