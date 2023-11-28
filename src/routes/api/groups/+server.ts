import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Role } from "$lib/schema";

export const PUT: RequestHandler = async ({ locals, request }) => {
    const session = await locals.validate();
    if (!session) {
        throw error(401, "Must authenticate first");
    }

    const data = await request.json();

    if (!data.name) throw error(400, "must specify group name in body");

    const group = await client.group.create({
        data: {
            name: data.name
        }
    });
    await client.userGroupMembership.create({
        data: {
            userId: session.user.userId,
            groupId: group.id,
            roleId: Role.GROUP_MANAGER
        }
    });

    return new Response(JSON.stringify({ group }), { status: 201 });
};
