import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import type { Group, Role as RoleModel } from "@prisma/client";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getFormatter } from "$lib/server/i18n";
import { requireLoginOrError } from "$lib/server/auth";

export const GET: RequestHandler = async ({ params, url }) => {
    const user = await requireLoginOrError();
    const $t = await getFormatter();
    if (params.userId !== user.id && user.roleId !== Role.ADMIN) error(401, $t("errors.not-authorized"));

    let groups: GroupInformation[];

    if (url.searchParams.get("active")) {
        const membership = await client.userGroupMembership.findFirstOrThrow({
            where: {
                userId: params.userId,
                active: true
            },
            select: {
                group: true,
                active: true,
                role: true
            }
        });

        groups = [toGroupInformation(membership)];
    } else {
        const membership = await client.userGroupMembership.findMany({
            where: {
                userId: params.userId
            },
            select: {
                group: true,
                active: true,
                role: true
            }
        });

        groups = membership.map(toGroupInformation);
    }

    return new Response(JSON.stringify({ groups }));
};

const toGroupInformation = (membership: { group: Group; active: boolean; role: RoleModel }): GroupInformation => {
    return {
        ...membership.group,
        active: membership.active,
        isManager: membership.role.id === Role.GROUP_MANAGER || membership.role.id === Role.ADMIN
    };
};
