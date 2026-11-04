import { Role } from "#lib/schema.js";
import { client } from "#lib/server/prisma.js";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAccessToGroup } from "../groups/[groupId]/auth";
import { tryDeleteImage } from "#lib/server/image-util.js";
import { getFormatter } from "#lib/server/i18n.js";
import { requireLoginOrError } from "#lib/server/auth.js";
import { logger } from "#lib/server/logger.js";

export const DELETE: RequestHandler = async ({ url }) => {
    const $t = await getFormatter();
    const groupId = url.searchParams.get("groupId");
    const claimed = url.searchParams.get("claimed");
    if (groupId) {
        const { authenticated } = await requireAccessToGroup(groupId);
        if (!authenticated) {
            error(403, $t("errors.not-authorized"));
        }
    } else {
        const user = await requireLoginOrError();
        if (user.roleId !== Role.ADMIN) {
            error(403, $t("errors.not-authorized"));
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
