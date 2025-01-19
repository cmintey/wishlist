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
