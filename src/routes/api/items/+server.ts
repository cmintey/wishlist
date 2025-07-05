import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAccessToGroup } from "../groups/[groupId]/auth";
import { tryDeleteImage } from "$lib/server/image-util";
import { itemEmitter } from "$lib/server/events/emitters";
import type { Prisma } from "@prisma/client";
import { patchItem } from "$lib/server/api-common";
import { getFormatter } from "$lib/server/i18n";
import { getItemInclusions } from "$lib/server/items";
import { ItemEvent } from "$lib/events";
import { requireLoginOrError } from "$lib/server/auth";
import { logger } from "$lib/server/logger";

export const DELETE: RequestHandler = async ({ url }) => {
    const $t = await getFormatter();
    const groupId = url.searchParams.get("groupId");
    const claimed = url.searchParams.get("claimed");
    if (groupId) {
        const { authenticated } = await requireAccessToGroup(groupId);
        if (!authenticated) {
            error(401, $t("errors.not-authorized"));
        }
    } else {
        const user = await requireLoginOrError();
        if (user.roleId !== Role.ADMIN) {
            error(401, $t("errors.not-authorized"));
        }
    }

    let items = await client.item.findMany({
        select: {
            id: true,
            imageUrl: true,
            quantity: true,
            lists: {
                select: {
                    listId: true
                }
            },
            claims: {
                select: {
                    id: true,
                    quantity: true
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
            }
        }
    });

    const partiallyClaimedItems: typeof items = [];
    if (claimed && Boolean(claimed)) {
        const fullyClaimedItems: typeof items = [];
        items.forEach((item) => {
            const claimedQty = item.claims.reduce((accum, claim) => accum + claim.quantity, 0);
            if (item.quantity === null || claimedQty < item.quantity) {
                partiallyClaimedItems.push(item);
            } else {
                fullyClaimedItems.push(item);
            }
        });
        items = fullyClaimedItems;
    }

    const fullyClaimedListItems = await client.listItem.findMany({
        select: {
            id: true,
            itemId: true,
            listId: true
        },
        where: {
            list: {
                groupId: groupId || undefined
            },
            itemId: {
                in: items.map(({ id }) => id)
            }
        }
    });

    try {
        await client.$transaction(async (tx) => {
            await tx.listItem.deleteMany({
                where: {
                    id: {
                        in: fullyClaimedListItems.map(({ id }) => id)
                    }
                }
            });

            await Promise.all(
                fullyClaimedListItems.map((li) =>
                    tx.itemClaim.deleteMany({
                        where: {
                            itemId: li.itemId,
                            listId: li.listId
                        }
                    })
                )
            );

            const itemsWithNoLists = await tx.item.findMany({
                select: {
                    id: true,
                    imageUrl: true
                },
                where: {
                    id: {
                        in: items.map(({ id }) => id)
                    },
                    lists: {
                        none: {}
                    }
                }
            });

            await tx.item.deleteMany({
                where: {
                    id: {
                        in: itemsWithNoLists.map(({ id }) => id)
                    }
                }
            });

            itemsWithNoLists.forEach((item) => {
                if (item.imageUrl) tryDeleteImage(item.imageUrl);
            });
        });

        if (partiallyClaimedItems.length > 0) {
            const itemsToUpdate: { id: number; quantity: number }[] = [];
            let claimsToDelete: string[] = [];
            partiallyClaimedItems.forEach((item) => {
                const claimedQty = item.claims.reduce((accum, claim) => accum + claim.quantity, 0);
                if (item.quantity) {
                    itemsToUpdate.push({ id: item.id, quantity: item.quantity - claimedQty });
                }
                claimsToDelete = [...claimsToDelete, ...item.claims.map(({ id }) => id)];
            });
            await client.$transaction(async (tx) => {
                await tx.itemClaim.deleteMany({
                    where: {
                        id: {
                            in: claimsToDelete
                        }
                    }
                });
                await Promise.all(
                    itemsToUpdate.map(({ id, quantity }) =>
                        tx.item.update({
                            data: {
                                quantity
                            },
                            where: {
                                id
                            }
                        })
                    )
                );
            });
        }

        return new Response(null, { status: 200 });
    } catch (err) {
        logger.error({ err }, "Unable to delete items");
        error(500, $t("errors.unable-to-delete-items"));
    }
};

export const PATCH: RequestHandler = async ({ request }) => {
    await requireLoginOrError();
    const $t = await getFormatter();

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
