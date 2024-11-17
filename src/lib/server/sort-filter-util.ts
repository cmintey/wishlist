import type { Prisma } from "@prisma/client";

export const createFilter = (filter: string | null) => {
    const search: Prisma.ItemWhereInput = {};
    if (filter === "unclaimed") {
        search.AND = [
            {
                pledgedById: null
            },
            {
                publicPledgedById: null
            }
        ];
    } else if (filter === "claimed") {
        search.OR = [
            {
                pledgedById: {
                    not: null
                }
            },
            {
                publicPledgedById: {
                    not: null
                }
            }
        ];
    }
    return search;
};

export const createSorts = (sort: string | null, direction: string | null) => {
    let orderBy: Prisma.ItemOrderByWithRelationInput[] = [];
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
    return orderBy;
};
