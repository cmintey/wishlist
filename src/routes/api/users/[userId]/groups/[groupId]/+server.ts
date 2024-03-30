import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import type { UserGroupMembership } from "@prisma/client";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ params, locals, request }) => {
    if (!locals.user) error(401, "user is not authenticated");
    if (params.userId !== locals.user.id && locals.user.roleId !== Role.ADMIN) error(401, "not authorized");

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
            error(400, "user is not a member of the group");
        }

        if (activeMembership?.id === membership.id) error(400, "group is already active");

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
