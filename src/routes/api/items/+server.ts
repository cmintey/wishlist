import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { _authCheck } from "../groups/[groupId]/auth";
import { tryDeleteImage } from "$lib/server/image-util";
import { itemEmitter } from "$lib/server/events/emitters";
import type { Prisma } from "@prisma/client";
import { patchItem } from "$lib/server/api-common";
import { getFormatter } from "$lib/i18n";
import { getItemInclusions } from "$lib/server/items";
import { ItemEvent } from "$lib/events";

export const DELETE: RequestHandler = async ({ locals, request }) => {
    const $t = await getFormatter();
    const groupId = new URL(request.url).searchParams.get("groupId");
    const claimed = new URL(request.url).searchParams.get("claimed");
    if (groupId) {
        const { authenticated } = await _authCheck(locals, groupId);
        if (!authenticated) {
            error(401, $t("errors.not-authorized"));
        }
    } else {
        if (!locals.user) {
            error(401, $t("errors.unauthenticated"));
        }
        if (locals.user.roleId !== Role.ADMIN) {
            error(401, $t("errors.not-authorized"));
        }
    }

    try {
        const items = await client.item.findMany({
            select: {
                id: true,
                imageUrl: true,
                lists: {
                    select: {
                        listId: true
                    }
                }
            },
            where: {
                lists: {
                    some: {
                        list: {
                            groupId: groupId || undefined
                        }
                    }
                },
                claims: {
                    some: claimed && Boolean(claimed) ? {} : undefined
                }
            }
        });

        for (const item of items) {
            if (item.imageUrl) {
                await tryDeleteImage(item.imageUrl);
            }
            itemEmitter.emit(ItemEvent.ITEM_DELETE, { id: item.id, lists: item.lists.map((l) => ({ id: l.listId })) });
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
        error(500, $t("errors.unable-to-delete-items"));
    }
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
    const $t = await getFormatter();
    if (!locals.user) error(401, $t("errors.unauthenticated"));

    const body = (await request.json()) as Record<string, unknown>[];
    const itemIds = body.map((item) => {
        if (!item.id) {
            error(422, $t("errors.one-or-more-items-missing-an-id"));
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
            error(404, $t("errors.item-with-id-item-id-not-found", { values: { id: item.id } }));
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
            include: getItemInclusions(),
            data: patch.data as Prisma.ItemUpdateInput
        });
    });

    try {
        const updatedItems = await client.$transaction(itemsToUpdate);

        if (imageUrlsToDelete.length > 0) {
            for (const imageUrl of imageUrlsToDelete) {
                if (imageUrl) await tryDeleteImage(imageUrl as string);
            }
        }

        itemEmitter.emit(ItemEvent.ITEMS_UPDATE);

        return new Response(JSON.stringify(updatedItems), { status: 200 });
    } catch {
        error(404, $t("errors.item-not-found"));
    }
};
