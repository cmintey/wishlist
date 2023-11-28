import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { inviteUser } from "$lib/server/invite-user";

export const load: PageServerLoad = async ({ locals }) => {
    const session = await locals.validate();
    if (!session) {
        throw redirect(302, `/login?ref=/admin/users`);
    }
    if (session.user.roleId !== Role.ADMIN) {
        throw error(401, "Not authorized to view admin panel");
    }

    const users = await client.user.findMany({
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

    const groups = client.group.findMany();

    const config = getConfig();

    return {
        user: {
            isAdmin: true,
            ...session.user
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
