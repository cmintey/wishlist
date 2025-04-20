import { init } from "@paralleldrive/cuid2";
import { client } from "./prisma";
import { createFilter } from "./sort-filter-util";
import { toItemOnListDTO } from "../dtos/item-mapper";
import { getItemInclusions } from "./items";
import type { Prisma } from "@prisma/client";
import { getConfig } from "./config";

export interface GetItemsOptions {
    filter: string | null;
    sort: string | null;
    sortDir: string | null;
    suggestionMethod: SuggestionMethod;
    listOwnerId: string;
    loggedInUserId: string | null;
}

export interface ListProperties {
    name?: string | null;
    icon?: string | null;
    iconColor?: string | null;
    public?: boolean;
}

export const create = async (ownerId: string, groupId: string, otherData?: ListProperties) => {
    const cuid2 = init({ length: 10 });
    return await client.list.create({
        data: {
            id: cuid2(),
            ownerId,
            groupId,
            ...otherData
        }
    });
};

export const deleteList = async (id: string) => {
    return client.$transaction(async (tx) => {
        const list = await tx.list.delete({
            select: {
                id: true,
                items: {
                    select: {
                        item: {
                            select: {
                                id: true,
                                userId: true,
                                lists: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            where: {
                id
            }
        });
        const orphanedItems = list.items
            .map((li) => li.item)
            .filter((i) => i.lists.filter((l) => l.id !== list.id).length === 0)
            .map((i) => i.id);
        await tx.item.deleteMany({
            where: {
                id: {
                    in: orphanedItems
                }
            }
        });
    });
};

export const deleteLists = async (ownerId: string | undefined, groupId: string) => {
    return client.$transaction(async (tx) => {
        const lists = await tx.list.findMany({
            select: {
                id: true,
                items: {
                    select: {
                        item: {
                            select: {
                                id: true,
                                userId: true,
                                lists: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            where: {
                ownerId,
                groupId
            }
        });
        await tx.list.deleteMany({
            where: {
                id: {
                    in: lists.map((l) => l.id)
                }
            }
        });
        const listIds = new Set(lists.map((l) => l.id));
        const orphanedItems = lists
            .flatMap((list) => list.items)
            .map((li) => li.item)
            .filter((i) => i.lists.filter((l) => !listIds.has(l.id)).length === 0)
            .map((i) => i.id);
        await tx.item.deleteMany({
            where: {
                id: {
                    in: orphanedItems
                }
            }
        });
    });
};

export const getById = async (id: string) => {
    return await client.list.findUnique({
        select: {
            id: true,
            name: true,
            owner: {
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            },
            groupId: true,
            public: true
        },
        where: {
            id
        }
    });
};

export const getItems = async (listId: string, options: GetItemsOptions) => {
    const itemFilter = createFilter(options.filter);
    const itemListFilter: Prisma.ListItemWhereInput = {};

    // In "approval" mode, don't show items awaiting approval unless the logged in user is the owner
    if (
        options.suggestionMethod === "approval" &&
        !options.loggedInUserId &&
        options.loggedInUserId !== options.listOwnerId
    ) {
        itemListFilter.approved = true;
    }

    // In "surprise" mode, only show the items the owner added
    if (options.suggestionMethod === "surprise" && options.loggedInUserId === options.listOwnerId) {
        itemListFilter.addedById = options.loggedInUserId;
    }

    const list = await client.list.findUnique({
        where: {
            id: listId
        },
        select: {
            id: true
        }
    });

    if (!list) {
        return [];
    }

    const items = await client.item.findMany({
        where: {
            lists: {
                some: {
                    listId: list.id
                },
                every: itemListFilter
            },
            ...itemFilter
        },
        include: getItemInclusions(list.id)
    });

    // need to filter out items not on a list because prisma generates a stupid query
    const itemDTOs = items.filter((item) => item.lists.length > 0).map((i) => toItemOnListDTO(i, list.id));

    if (options.sort === "price") {
        if (options.sortDir === "desc") {
            itemDTOs.sort((a, b) => (b.itemPrice?.value ?? -Infinity) - (a.itemPrice?.value ?? -Infinity));
        } else {
            itemDTOs.sort((a, b) => (a.itemPrice?.value ?? Infinity) - (b.itemPrice?.value ?? Infinity));
        }
    } else {
        itemDTOs.sort((a, b) => (a.displayOrder ?? Infinity) - (b.displayOrder ?? Infinity));
    }

    return itemDTOs;
};

const availableListSelection: Prisma.ListFindManyArgs["select"] = {
    id: true,
    name: true,
    public: true,
    owner: {
        select: {
            name: true
        }
    },
    group: {
        select: {
            id: true,
            name: true
        }
    }
};

/**
 * Returns all lists that are owned by ownerId that can be accessed by loggedInUserId.
 * Accessed in this context means the logged in user is either in the same group as the list
 * or the list is public. In both scenarios, suggestions must be enabled for the group
 */
export const getAvailableLists = async (ownerId: string, loggedInUserId: string) => {
    if (ownerId === loggedInUserId) {
        return await client.list.findMany({
            select: availableListSelection,
            where: {
                ownerId
            }
        });
    }

    const overlappingGroups = await Promise.all([
        client.userGroupMembership.findMany({
            select: {
                groupId: true
            },
            where: {
                userId: ownerId
            }
        }),
        client.userGroupMembership.findMany({
            select: {
                groupId: true
            },
            where: {
                userId: loggedInUserId
            }
        })
    ]).then(([ownersGroups, loggedInUsersGroups]) => {
        const ownersGroupIds = new Set(ownersGroups.map(({ groupId }) => groupId));
        const loggedInUserGroupIds = new Set(loggedInUsersGroups.map(({ groupId }) => groupId));
        return ownersGroupIds.intersection(loggedInUserGroupIds);
    });

    const ownersListsInCommonGroups = await client.list.findMany({
        select: availableListSelection,
        where: {
            ownerId,
            groupId: {
                in: [...overlappingGroups]
            }
        }
    });

    const ownersPublicLists = await client.list.findMany({
        select: availableListSelection,
        where: {
            ownerId,
            public: true,
            id: {
                notIn: ownersListsInCommonGroups.map(({ id }) => id)
            }
        }
    });

    const listsAvailable = [];
    for (const list of [...ownersListsInCommonGroups, ...ownersPublicLists]) {
        const groupConfig = await getConfig(list.group.id);
        if (groupConfig.suggestions.enable) {
            listsAvailable.push(list);
        }
    }

    return listsAvailable;

    // const lists = await client.userGroupMembership
    //     .findMany({
    //         select: {
    //             groupId: true
    //         },
    //         where: {
    //             userId: loggedInUserId
    //         }
    //     })
    //     .then((groups) =>
    //         Promise.all(groups.map(async (group) => ({ id: group.groupId, config: await getConfig(group.groupId) })))
    //     )
    //     .then((groups) =>
    //         ownerId === loggedInUserId ? groups : groups.filter(({ config }) => config.suggestions.enable)
    //     )
    //     .then((groups) =>
    //         client.list.findMany({
    //             select: {
    //                 id: true,
    //                 name: true,
    //                 public: true,
    //                 owner: {
    //                     select: {
    //                         name: true
    //                     }
    //                 },
    //                 group: {
    //                     select: {
    //                         id: true,
    //                         name: true
    //                     }
    //                 }
    //             },
    //             where: {
    //                 ownerId: ownerId,
    //                 OR: [
    //                     {
    //                         groupId: {
    //                             in: groups.map((g) => g.id)
    //                         }
    //                     },
    //                     {
    //                         public: true
    //                     }
    //                 ]
    //             }
    //         })
    //     );

    // return Promise.all(
    //     lists.filter((list) => list.public).map(async (list) => ({ list, config: await getConfig(list.group.id) }))
    // ).then((publicLists) => {
    //     return [
    //         ...lists.filter((list) => !list.public),
    //         ...publicLists.filter((list) => list.config.suggestions.enable).map(({ list }) => list)
    //     ];
    // });
};
