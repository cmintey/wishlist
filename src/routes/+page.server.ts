import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";
import { getActiveMembership } from "$lib/server/group-membership";
import { getConfig } from "$lib/server/config";

export const load = (async ({ locals }) => {
    const user = locals.user;
    if (!user) {
        redirect(302, `/login`);
    }

    const activeMembership = await getActiveMembership(user);
    const config = await getConfig(activeMembership.groupId);
    if (config.listMode === "registry") {
        redirect(302, "/wishlists/me");
    }

    const userListsQuery = client.list.findMany({
        where: {
            ownerId: user.id,
            groupId: activeMembership.groupId
        },
        select: {
            id: true,
            name: true,
            owner: {
                select: {
                    name: true,
                    username: true,
                    picture: true
                }
            },
            items: {
                select: {
                    id: true
                },
                where: {
                    addedBy:
                        config.suggestions.enable && config.suggestions.method === "surprise"
                            ? { username: user.username }
                            : undefined
                }
            },
            _count: {
                select: {
                    items: {
                        where: {
                            approved: false
                        }
                    }
                }
            }
        }
    });

    const otherListsQuery = client.list.findMany({
        where: {
            ownerId: {
                not: user.id
            },
            groupId: activeMembership.groupId
        },
        select: {
            id: true,
            name: true,
            owner: {
                select: {
                    name: true,
                    username: true,
                    picture: true
                }
            },
            items: {
                select: {
                    id: true,
                    approved: true,
                    pledgedById: true
                }
            }
        }
    });

    const [myLists, otherLists] = await Promise.all([userListsQuery, otherListsQuery]);

    return {
        myLists: myLists.map((list) => {
            return {
                id: list.id,
                name: list.name,
                owner: list.owner,
                claimedCount: undefined,
                itemCount: list.items.length,
                unapprovedCount: list._count.items
            };
        }),
        otherLists: otherLists.map((list) => {
            const claimedCount = list.items.filter((it) => it.approved && it.pledgedById !== null).length;
            const itemCount = list.items.filter((it) => it.approved).length;
            const items = list.items.map((it) => ({ id: it.id }));
            return {
                id: list.id,
                name: list.name,
                owner: list.owner,
                claimedCount,
                itemCount,
                items
            };
        })
    };
}) satisfies PageServerLoad;
