import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { inviteUser } from "$lib/server/invite-user";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, `/login?ref=/admin/users`);
    }
    if (locals.user.roleId !== Role.ADMIN) {
        error(401, "Not authorized to view admin panel");
    }

    const usersQuery = client.user.findMany({
        select: {
            username: true,
            name: true,
            email: true,
            role: {
                select: {
                    id: true
                }
            },
            UserGroupMembership: {
                select: {
                    group: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });

    const [users, groups, config] = await Promise.all([usersQuery, client.group.findMany(), getConfig()]);

    return {
        user: {
            isAdmin: true,
            ...locals.user
        },
        users: users.map((user) => ({
            isAdmin: user.role.id === Role.ADMIN,
            groups: user.UserGroupMembership.map(({ group }) => group.name),
            ...user
        })),
        config,
        groups
    };
};

export const actions: Actions = {
    default: inviteUser
};
