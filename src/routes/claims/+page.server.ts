import type { PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getActiveMembership } from "$lib/server/group-membership";
import { toItemOnListDTO } from "$lib/dtos/item-mapper";
import { requireLogin } from "$lib/server/auth";

export const load: PageServerLoad = async () => {
    const user = requireLogin();

    const activeMembership = await getActiveMembership(user);

    const items = await client.item.findMany({
        where: {
            claims: {
                some: {
                    claimedById: user.id
                }
            },
            lists: {
                some: {
                    list: {
                        groupId: activeMembership.groupId
                    }
                }
            }
        },
        include: {
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
                    }
                },
                where: {
                    list: {
                        groupId: activeMembership.groupId
                    }
                }
            },
            claims: {
                select: {
                    id: true,
                    listId: true,
                    purchased: true,
                    quantity: true,
                    claimedBy: {
                        select: {
                            id: true,
                            name: true,
                            UserGroupMembership: {
                                select: {
                                    groupId: true
                                }
                            }
                        }
                    },
                    publicClaimedBy: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                where: {
                    claimedById: user.id,
                    list: {
                        groupId: activeMembership.groupId
                    }
                }
            },
            user: {
                select: {
                    id: true,
                    name: true
                }
            },
            itemPrice: true,
            _count: {
                select: {
                    lists: true
                }
            }
        }
    });

    const itemDTOs = items.map((item) => {
        const claim = item.claims[0];
        return toItemOnListDTO(item, claim.listId);
    });

    return {
        user: {
            ...user,
            activeGroupId: activeMembership.groupId
        },
        items: itemDTOs
    };
};
