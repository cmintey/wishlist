import { Role } from "$lib/schema";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getFormatter } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals, url, params }) => {
    const $t = await getFormatter();
    if (!locals.user) {
        redirect(302, `/login?ref=/admin`);
    }
    const userGroupRoleId = await client.userGroupMembership.findFirst({
        where: {
            userId: locals.user.id,
            groupId: params.groupId
        },
        select: {
            roleId: true
        }
    });

    if (!(locals.user.roleId === Role.ADMIN || userGroupRoleId?.roleId === Role.GROUP_MANAGER)) {
        error(401, $t("errors.not-authorized"));
    }

    redirect(302, `${url.pathname}/members`);
};
