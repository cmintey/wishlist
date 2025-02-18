import type { Prisma } from "@prisma/client";

export const getItemInclusions = (listId?: string) => {
    return {
        lists: {
            select: {
                listId: true,
                approved: true,
                displayOrder: true,
                addedBy: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                itemClaims: {
                    select: {
                        id: true,
                        purchased: true,
                        claimedBy: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        publicClaimedBy: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            where: {
                listId
            }
        },
        user: {
            select: {
                id: true,
                name: true
            }
        },
        itemPrice: true
    } satisfies Prisma.ItemInclude;
};
