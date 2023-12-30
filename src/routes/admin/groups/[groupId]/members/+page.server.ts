import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { inviteUser } from "$lib/server/invite-user";

export const load = (async ({ locals, params }) => {
    const session = await locals.validate();
    if (!session) {
        redirect(302, `/login?ref=/admin/groups/${params.groupId}`);
    }

    const userGroupRoleId = await client.userGroupMembership.findFirst({
        where: {
            userId: session.user.userId,
            groupId: params.groupId
        },
        select: {
            roleId: true
        }
    });

    if (!(session.user.roleId === Role.ADMIN || userGroupRoleId?.roleId === Role.GROUP_MANAGER)) {
        error(401, "Not authorized to view admin panel");
    }

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
        user: {
            isAdmin: true,
            ...session.user
        },
        config
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: inviteUser
};
