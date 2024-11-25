import { Role, SSEvent } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { _authCheck } from "../groups/[groupId]/auth";
import { tryDeleteImage } from "$lib/server/image-util";
import { emitEvent } from "$lib/server/events/emitters";
import type { Prisma } from "@prisma/client";
import { patchItem } from "$lib/server/api-common";

export const DELETE: RequestHandler = async ({ locals, request }) => {
    const groupId = new URL(request.url).searchParams.get("groupId");
    const claimed = new URL(request.url).searchParams.get("claimed");
    if (groupId) {
        const { authenticated } = await _authCheck(locals, groupId);
        if (!authenticated) {
            error(401, "Not authorized to delete items for this group");
        }
    } else {
        if (!locals.user) {
            error(401, "Must authenticate first");
        }
        if (locals.user.roleId !== Role.ADMIN) {
            error(401, "Not authorized to delete items");
        }
    }

    try {
        const items = await client.item.findMany({
            select: {
                id: true,
                imageUrl: true
            },
            where: {
                groupId: groupId ? groupId : undefined,
                pledgedById: claimed && Boolean(claimed) ? { not: null } : undefined
            }
        });

        for (const item of items) {
            if (item.imageUrl) {
                await tryDeleteImage(item.imageUrl);
            }
            emitEvent(SSEvent.ItemDelete, item);
        }

        const deletedItems = await client.item.deleteMany({
            where: {
                id: {
                    in: items.map((item) => item.id)
                }
            }
        });

        return new Response(JSON.stringify(deletedItems), { status: 200 });
    } catch {
        error(500, "Unable to delete items");
    }
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
    if (!locals.user) error(401, "user is not authenticated");

    const body = (await request.json()) as Record<string, unknown>[];
    const itemIds = body.map((item) => {
        if (!item.id) {
            error(422, "One or more items missing an id");
        }
        return item.id as number;
    });

    const items = await client.item.findMany({
        where: {
            id: {
                in: itemIds
            }
        },
        orderBy: {
            id: "asc"
        }
    });

    const idsSet = new Set(itemIds);
    items.forEach((item) => {
        if (!idsSet.has(item.id)) {
            error(404, `Item with id ${item.id} not found`);
        }
    });

    const patches = body.map((bodyValue) => patchItem(bodyValue));
    const imageUrlsToDelete = patches
        .filter((patch) => patch.deleteOldImage)
        .map((patch) => items.find((item) => item.id === patch.data.id))
        .map((item) => item?.imageUrl)
        .filter((url) => url !== null);
    const itemsToUpdate = patches.map((patch) => {
        const id = patch.data.id;
        delete patch.data.id;
        return client.item.update({
            where: {
                id
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
                publicPledgedBy: {
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
                itemPrice: true
            },
            data: patch.data as Prisma.ItemUpdateInput
        });
    });

    let updatedItems;
    try {
        updatedItems = await client.$transaction(itemsToUpdate);
    } catch {
        error(404, "Unable to update items");
    }

    if (imageUrlsToDelete.length > 0) {
        for (const imageUrl of imageUrlsToDelete) {
            if (imageUrl) await tryDeleteImage(imageUrl as string);
        }
    }

    emitEvent(SSEvent.ItemsUpdate);

    return new Response(JSON.stringify(updatedItems), { status: 200 });
};
