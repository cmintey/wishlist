import type { Prisma } from "@prisma/client";

export const createFilter = (filter: string | null) => {
    const search: Prisma.ListItemWhereInput = {};
    if (filter === "unclaimed") {
        search.AND = [
            {
                itemClaims: {
                    every: {
                        claimedById: null
                    }
                }
            },
            {
                itemClaims: {
                    every: {
                        publicClaimedById: null
                    }
                }
            }
        ];
    } else if (filter === "claimed") {
        search.OR = [
            {
                itemClaims: {
                    every: {
                        claimedById: null
                    }
                }
            },
            {
                itemClaims: {
                    every: {
                        publicClaimedById: null
                    }
                }
            }
        ];
    }
    return search;
};

export const decodeMultiValueFilter = (filter: string | null) => {
    if (filter === null) {
        return [] as string[];
    }
    return decodeURIComponent(filter).split(",");
};
