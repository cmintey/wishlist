import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";
import { getActiveMembership } from "$lib/server/group-membership";
import { toItemOnListDTO } from "$lib/dtos/item-mapper";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, `/login?ref=/claims`);
    }

    const activeMembership = await getActiveMembership(locals.user);

    const claims = await client.itemClaim.findMany({
        where: {
            claimedById: locals.user.id,
            listItem: {
                list: {
                    groupId: activeMembership.groupId
                }
            }
        },
        select: {
            id: true,
            purchased: true,
            claimedBy: {
                select: {
                    id: true,
                    name: true
                }
            },
            listItem: {
                select: {
                    addedBy: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    item: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            },
                            itemPrice: true
                        }
                    },
                    listId: true,
                    approved: true,
                    displayOrder: true
                }
            }
        }
    });

    const items = claims
        .map((claim) => {
            const { item, ...list } = claim.listItem;
            return {
                ...item,
                lists: [
                    {
                        ...list,
                        itemClaims: [
                            {
                                id: claim.id,
                                purchased: claim.purchased,
                                claimedBy: claim.claimedBy,
                                publicClaimedBy: null
                            }
                        ]
                    }
                ]
            };
        })
        .map((i) => toItemOnListDTO(i, i.lists[0].listId));

    return {
        user: locals.user,
        items
    };
};
