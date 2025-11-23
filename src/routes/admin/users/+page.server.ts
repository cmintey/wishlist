import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import type { PageServerLoad } from "./$types";
import { requireRole } from "$lib/server/auth";

export const load: PageServerLoad = async () => {
    const user = await requireRole(Role.ADMIN);

    const usersQuery = client.user.findMany({
        select: {
            id: true,
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
            ...user
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
