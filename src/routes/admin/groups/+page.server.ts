import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, `/login?ref=/admin/groups`);
    }
    if (locals.user.roleId !== Role.ADMIN) {
        error(401, "Not authorized to view admin panel");
    }

    const groups = await client.group
        .findMany({
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        UserGroupMembership: true
                    }
                }
            }
        })
        .then((groups) => groups.map((group) => ({ userCount: group._count.UserGroupMembership, ...group })));

    return {
        groups
    };
};
