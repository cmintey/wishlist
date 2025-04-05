import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import type { PageServerLoad } from "./$types";
import { requireAdminOrManager } from "$lib/server/auth";

export const load = (async ({ params }) => {
    await requireAdminOrManager(params.groupId);

    const group = await client.group
        .findUniqueOrThrow({
            where: {
                id: params.groupId
            },
            select: {
                id: true,
                name: true,
                UserGroupMembership: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                email: true,
                                role: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        },
                        roleId: true
                    }
                }
            }
        })
        .then((group) => ({
            id: group?.id,
            name: group?.name,
            users: group?.UserGroupMembership.map((membership) => ({
                ...membership.user,
                isGroupManager: membership.roleId === Role.GROUP_MANAGER
            }))
        }));

    const config = await getConfig(group.id);

    return {
        group,
        config
    };
}) satisfies PageServerLoad;
