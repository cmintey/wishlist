import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";
import type { Prisma } from "@prisma/client";
import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";

export const load: PageServerLoad = async ({ locals, params, url, depends }) => {
    if (!locals.user) {
        redirect(302, `/login?ref=/wishlists/${params.username}`);
    }

    const activeMembership = await getActiveMembership(locals.user);
    const config = await getConfig(activeMembership.groupId);

    try {
        await client.userGroupMembership.findFirstOrThrow({
            where: {
                user: {
                    username: params.username
                },
                groupId: activeMembership.groupId
            }
        });
    } catch {
        error(404, "user is not part of the group");
    }

    const search: Prisma.ItemWhereInput = {
        user: {
            username: params.username
        },
        group: {
            id: activeMembership.groupId
        }
    };

    if (config.suggestions.method === "approval" && params.username !== locals.user.username) {
        search.approved = true;
    }

    if (config.suggestions.method === "surprise" && params.username === locals.user.username) {
        search.addedBy = {
            username: locals.user.username
        };
    }

    const filter = url.searchParams.get("filter");
    if (filter === "unclaimed") {
        search.pledgedById = null;
    } else if (filter === "claimed") {
        search.pledgedById = {
            not: null
        };
    }

    let orderBy: Prisma.ItemOrderByWithRelationInput[];
    const sort = url.searchParams.get("sort");
    const direction = url.searchParams.get("dir");
    if (sort === "price" && direction && (direction === "asc" || direction === "desc")) {
        orderBy = [
            {
                itemPrice: {
                    value: direction
                }
            }
        ];
    } else {
        orderBy = [
            {
                displayOrder: {
                    sort: "asc",
                    nulls: "last"
                }
            },
            {
                id: "asc"
            }
        ];
    }

    const wishlistItemsQuery = client.item.findMany({
        where: search,
        orderBy,
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
        }
    });

    const listOwnerQuery = client.user.findUniqueOrThrow({
        where: {
            username: params.username
        },
        select: {
            name: true,
            id: true
        }
    });

    const [wishlistItems, listOwner] = await Promise.all([wishlistItemsQuery, listOwnerQuery]);

    depends("data:items");
    return {
        user: locals.user,
        listOwner: {
            isMe: params.username === locals.user.username,
            ...listOwner
        },
        items: wishlistItems,
        suggestionsEnabled: config.suggestions.enable,
        showClaimedName: config.claims.showName,
        listMode: config.listMode,
        groupId: activeMembership.groupId
    };
};
