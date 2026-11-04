import { Role } from "#lib/schema.js";
import { requireLoginOrError } from "#lib/server/auth.js";
import { client } from "#lib/server/prisma.js";

export const requireAccessToGroup = async (groupId: string) => {
    const authUser = await requireLoginOrError();

    const user = await client.user.findFirstOrThrow({
        where: {
            id: authUser.id
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
