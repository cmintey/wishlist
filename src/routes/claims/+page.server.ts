import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";
import { getActiveMembership } from "$lib/server/group-membership";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, `/login?ref=/claims`);
    }

    const activeMembership = await getActiveMembership(locals.user);

    const wishlistItems = await client.item.findMany({
        where: {
            pledgedBy: {
                username: locals.user.username
            },
            groupId: activeMembership.groupId
        },
        include: {
            addedBy: {
                select: {
                    username: true,
                    name: true
                }
            },
            pledgedBy: {
                select: {
                    username: true,
                    name: true
                }
            },
            user: {
                select: {
                    username: true,
                    name: true
                }
            }
        }
    });

    return {
        user: locals.user,
        items: wishlistItems
    };
};
