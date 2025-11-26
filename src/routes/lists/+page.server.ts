import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getActiveMembership } from "$lib/server/group-membership";
import { getConfig } from "$lib/server/config";
import { decodeMultiValueFilter } from "$lib/server/sort-filter-util";
import { requireLogin } from "$lib/server/auth";
import { listRepository } from "$lib/server/db/list.repository";

export const load = (async ({ url }) => {
    const user = requireLogin();

    const activeMembership = await getActiveMembership(user);
    const config = await getConfig(activeMembership.groupId);
    if (config.listMode === "registry") {
        const list = await listRepository.findByOwnerIdAndGroupId(user.id, activeMembership.groupId);
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

    const userListsQuery = listRepository.getListsForLoggedInUser(user.id, activeMembership.groupId);
    const otherListsQuery = listRepository.getListsForNonLoggedInUser(user.id, activeMembership.groupId);

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

    // const otherListsQuery = client.list.findMany({
    //     where: {
    //         ownerId: {
    //             not: user.id
    //         },
    //         groupId: activeMembership.groupId
    //     },
    //     orderBy: [
    //         {
    //             owner: {
    //                 name: "asc"
    //             }
    //         },
    //         {
    //             name: "asc"
    //         }
    //     ],
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
    //                 approved: true,
    //                 item: {
    //                     select: {
    //                         id: true,
    //                         quantity: true,
    //                         claims: {
    //                             select: {
    //                                 id: true,
    //                                 quantity: true
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // });

    const [myLists, otherLists, hashes] = await Promise.all([
        userListsQuery,
        otherListsQuery,
        listRepository.getListHashes({ groupId: activeMembership.groupId })
    ]);

    const users = [
        {
            id: user.id,
            name: user.name,
            picture: user.picture || null
        },
        ...new Set(
            otherLists.map((list) => ({
                id: list.ownerId,
                name: list.ownerName,
                picture: list.picture || null
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
            // .filter((list) => userIdFilter.length === 0 || userIdFilter.includes(list.owner.id))
            .map((list) => {
                // const claimedCount = list.items
                //     .filter((it) => it.approved)
                //     .filter(({ item }) => {
                //         const claimedCount = item.claims.map(({ quantity }) => quantity).reduce((a, b) => a + b, 0);
                //         return claimedCount === item.quantity;
                //     }).length;
                // const itemCount = list.items
                //     .filter((it) => it.approved)
                //     .reduce((accum, { item }) => accum + (item.quantity || 1), 0);
                // const items = list.items.map((it) => ({ id: it.item.id }));
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
                    claimedCount: list.claimedCount, // TODO: fix this count
                    itemCount: list.totalCount,
                    hash: hashes[list.id]
                    // items
                };
            }),
        users
    };
}) satisfies PageServerLoad;
