import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import type { UserGroupMembership } from "$lib/generated/prisma/client";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getFormatter } from "$lib/server/i18n";
import { requireLoginOrError } from "$lib/server/auth";

export const PATCH: RequestHandler = async ({ params, request }) => {
    const user = await requireLoginOrError();
    const $t = await getFormatter();
    if (params.userId !== user.id && user.roleId !== Role.ADMIN) {
        error(401, $t("errors.not-authorized"));
    }

    const data = await request.json();

    if (data.active) {
        const activeMembership = await client.userGroupMembership.findFirst({
            where: {
                userId: params.userId,
                active: true
            }
        });

        let membership: UserGroupMembership;
        try {
            membership = await client.userGroupMembership.findFirstOrThrow({
                where: {
                    groupId: params.groupId,
                    userId: params.userId
                }
            });
        } catch {
            error(400, $t("errors.user-is-not-a-member-of-the-group"));
        }

        if (activeMembership?.id === membership.id) error(400, $t("errors.group-is-already-active"));

        membership = await client.userGroupMembership.update({
            where: {
                id: membership.id
            },
            data: {
                active: true
            }
        });

        if (activeMembership) {
            await client.userGroupMembership.update({
                where: {
                    id: activeMembership.id
                },
                data: {
                    active: false
                }
            });
        }

        return new Response(JSON.stringify({ membership }));
    }

    return new Response();
};
