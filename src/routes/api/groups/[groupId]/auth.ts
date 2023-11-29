import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const _authCheck = async (validate: App.Locals["validate"], groupId: string) => {
    const session = await validate();
    if (!session) {
        throw error(401, "Must authenticate first");
    }

    const user = await client.user.findFirstOrThrow({
        where: {
            id: session.user.userId
        },
        select: {
            id: true,
            roleId: true,
            UserGroupMembership: {
                where: {
                    groupId: groupId
                },
                select: {
                    roleId: true
                }
            }
        }
    });

    return {
        authenticated: user.roleId === Role.ADMIN || user.UserGroupMembership[0]?.roleId === Role.GROUP_MANAGER,
        user
    };
};
