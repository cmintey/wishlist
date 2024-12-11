import { getFormatter } from "$lib/i18n";
import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const _authCheck = async (locals: App.Locals, groupId: string) => {
    const $t = await getFormatter();
    if (!locals.user) {
        error(401, $t("errors.unauthenticated"));
    }

    const user = await client.user.findFirstOrThrow({
        where: {
            id: locals.user.id
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
