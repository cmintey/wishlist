import { init } from "@paralleldrive/cuid2";
import { client } from "./prisma";
import { createFilter } from "./sort-filter-util";

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
    const filter = createFilter(options.filter);

    // In "approval" mode, don't show items awaiting approval unless the logged in user is the owner
    if (
        options.suggestionMethod === "approval" &&
        !options.loggedInUserId &&
        options.loggedInUserId !== options.listOwnerId
    ) {
        filter.approved = true;
    }

    // In "surprise" mode, only show the items the owner added
    if (options.suggestionMethod === "surprise" && options.loggedInUserId === options.listOwnerId) {
        filter.addedById = options.loggedInUserId;
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

    let items = await client.item.findMany({
        where: {
            lists: {
                every: {
                    id: list.id
                }
            },
            ...filter
        },
        include: {
            lists: {
                select: {
                    id: true
                },
                where: {
                    id: list.id
                }
            },
            addedBy: {
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            },
            pledgedBy: {
                select: {
                    id: true,
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
                    id: true,
                    username: true,
                    name: true
                }
            },
            itemPrice: true
        }
    });

    // need to filter out items not on a list because prisma generates a stupid query
    items = items.filter((item) => item.lists.length > 0);

    if (options.sort === "price") {
        if (options.sortDir === "desc") {
            items.sort((a, b) => (b.itemPrice?.value ?? -Infinity) - (a.itemPrice?.value ?? -Infinity));
        } else {
            items.sort((a, b) => (a.itemPrice?.value ?? Infinity) - (b.itemPrice?.value ?? Infinity));
        }
    } else {
        items.sort((a, b) => (a.displayOrder ?? Infinity) - (b.displayOrder ?? Infinity));
    }
    return items;
};
