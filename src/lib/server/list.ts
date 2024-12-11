import { client } from "./prisma";
import { createFilter, createSorts } from "./sort-filter-util";

export interface GetItemsOptions {
    filter: string | null;
    sort: string | null;
    sortDir: string | null;
    suggestionMethod: SuggestionMethod;
    listOwnerId: string;
    loggedInUserId: string | null;
}

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
    const orderBy = createSorts(options.sort, options.sortDir);

    filter.lists = {
        every: {
            id: listId
        }
    };

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
        filter.addedBy = {
            id: options.loggedInUserId
        };
    }

    const items = await client.item.findMany({
        where: filter,
        orderBy: orderBy,
        include: {
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

    if (options.sort === "price" && options.sortDir === "asc") {
        // need to re-sort when descending since Prisma can't order with nulls last
        items.sort((a, b) => (a.itemPrice?.value ?? Infinity) - (b.itemPrice?.value ?? Infinity));
    }
    return items;
};
