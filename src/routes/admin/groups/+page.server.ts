import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getFormatter } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals }) => {
    const $t = await getFormatter();
    if (!locals.user) {
        redirect(302, `/login?ref=/admin/groups`);
    }
    if (locals.user.roleId !== Role.ADMIN) {
        error(401, $t("errors.not-authorized"));
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
