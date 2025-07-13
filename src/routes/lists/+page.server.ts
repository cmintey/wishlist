import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getActiveMembership } from "$lib/server/group-membership";
import { getConfig } from "$lib/server/config";
import { decodeMultiValueFilter } from "$lib/server/sort-filter-util";
import { requireLogin } from "$lib/server/auth";
import { db } from "$lib/server/db";

export const load = (async ({ url }) => {
    const user = requireLogin();

    const activeMembership = await getActiveMembership(user);
    const config = await getConfig(activeMembership.groupId);
    if (config.listMode === "registry") {
        const list = await client.list.findFirst({
            select: {
                id: true
            },
            where: {
                ownerId: user.id,
                groupId: activeMembership.groupId
            }
        });
        if (list) {
            redirect(302, `/lists/${list.id}`);
        }
        return {
            myLists: [],
            otherLists: [],
            users: [
                {
                    id: user.id,
                    name: user.name,
                    picture: user.picture || null
                }
            ]
        };
    }

    const userIdFilter = decodeMultiValueFilter(url.searchParams.get("users"));

    const userListsQuery = db
        .selectFrom("list as l")
        .innerJoin("user as u", "u.id", "l.ownerId")
        .leftJoin("list_item as li", "li.listId", "l.id")
        .leftJoin("items as i", "li.itemId", "i.id")
        .select([
            "l.id",
            "l.name",
            "l.icon",
            "l.iconColor",
            "u.id as ownerId",
            "u.name as ownerName",
            "u.username",
            "u.picture"
        ])
        .select(({ fn, eb }) =>
            fn
                .sum<number>(
                    eb.case().when("li.id", "is", null).then(0).when("li.approved", "=", true).then(0).else(1).end()
                )
                .as("notApprovedCount")
        )
        .select(({ fn, eb }) =>
            fn.sum<number>(eb.case().when("li.id", "is not", "null").then(0).else(1).end()).as("totalCount")
        )
        .where("l.ownerId", "=", user.id)
        .where("l.groupId", "=", activeMembership.groupId)
        .groupBy("l.id");

    // const userListsQuery = client.list.findMany({
    //     where: {
    //         ownerId: user.id,
    //         groupId: activeMembership.groupId
    //     },
    //     orderBy: {
    //         name: "asc"
    //     },
    //     select: {
    //         id: true,
    //         name: true,
    //         icon: true,
    //         iconColor: true,
    //         owner: {
    //             select: {
    //                 id: true,
    //                 name: true,
    //                 username: true,
    //                 picture: true
    //             }
    //         },
    //         items: {
    //             select: {
    //                 id: true,
    //                 item: {
    //                     select: {
    //                         quantity: true
    //                     }
    //                 }
    //             },
    //             where: {
    //                 addedBy:
    //                     config.suggestions.enable && config.suggestions.method === "surprise"
    //                         ? { username: user.username }
    //                         : undefined
    //             }
    //         },
    //         _count: {
    //             select: {
    //                 items: {
    //                     where: {
    //                         approved: false
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // });

    const otherListsQuery = client.list.findMany({
        where: {
            ownerId: {
                not: user.id
            },
            groupId: activeMembership.groupId
        },
        orderBy: [
            {
                owner: {
                    name: "asc"
                }
            },
            {
                name: "asc"
            }
        ],
        select: {
            id: true,
            name: true,
            icon: true,
            iconColor: true,
            owner: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    picture: true
                }
            },
            items: {
                select: {
                    id: true,
                    approved: true,
                    item: {
                        select: {
                            id: true,
                            quantity: true,
                            claims: {
                                select: {
                                    id: true,
                                    quantity: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const [myLists, otherLists] = await Promise.all([userListsQuery.execute(), otherListsQuery]);

    const users = [
        {
            id: user.id,
            name: user.name,
            picture: user.picture || null
        },
        ...new Set(
            otherLists.map((list) => ({
                id: list.owner.id,
                name: list.owner.name,
                picture: list.owner.picture || null
            }))
        )
    ];

    return {
        myLists: myLists
            // .filter((list) => userIdFilter.length === 0 || userIdFilter.includes(list.owner.id))
            .map((list) => {
                return {
                    id: list.id,
                    name: list.name,
                    icon: list.icon,
                    iconColor: list.iconColor,
                    owner: {
                        id: list.ownerId,
                        name: list.ownerName,
                        username: list.username,
                        picture: list.picture
                    },
                    claimedCount: undefined,
                    itemCount: list.totalCount,
                    unapprovedCount: list.notApprovedCount
                    // itemCount: list.items.reduce((accum, { item }) => accum + (item.quantity || 1), 0),
                    // unapprovedCount: list._count.items
                };
            }),
        otherLists: otherLists
            .filter((list) => userIdFilter.length === 0 || userIdFilter.includes(list.owner.id))
            .map((list) => {
                const claimedCount = list.items
                    .filter((it) => it.approved)
                    .filter(({ item }) => {
                        const claimedCount = item.claims.map(({ quantity }) => quantity).reduce((a, b) => a + b, 0);
                        return claimedCount === item.quantity;
                    }).length;
                const itemCount = list.items
                    .filter((it) => it.approved)
                    .reduce((accum, { item }) => accum + (item.quantity || 1), 0);
                const items = list.items.map((it) => ({ id: it.item.id }));
                return {
                    id: list.id,
                    name: list.name,
                    icon: list.icon,
                    iconColor: list.iconColor,
                    owner: list.owner,
                    claimedCount,
                    itemCount,
                    items
                };
            }),
        users
    };
}) satisfies PageServerLoad;
