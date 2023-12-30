import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { client } from "$lib/server/prisma";
import { _authCheck } from "./auth";

export const DELETE: RequestHandler = async ({ locals, params }) => {
    const { authenticated } = await _authCheck(locals.validate, params.groupId);

    if (!authenticated) {
        error(401, "User is not authorized to delete this group");
    }

    const group = await client.group.findUnique({
        where: {
            id: params.groupId
        }
    });

    if (!group) error(404, "Group does not exist");

    await client.userGroupMembership.deleteMany({
        where: {
            groupId: group.id
        }
    });

    const deletedGroup = await client.group.delete({
        where: {
            id: group.id
        }
    });

    return new Response(JSON.stringify(deletedGroup));
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
    const { authenticated } = await _authCheck(locals.validate, params.groupId);

    if (!authenticated) {
        error(401, "User is not authorized to modify this group");
    }

    const body = (await request.json()) as Record<string, unknown>;
    if (!body?.name) {
        return new Response(JSON.stringify({}), { status: 200 });
    }

    const group = await client.group.findUnique({
        where: {
            id: params.groupId
        }
    });

    if (!group) error(404, "Group does not exist");

    const updatedGroup = await client.group.update({
        data: {
            name: body.name
        },
        where: {
            id: group.id
        }
    });

    return new Response(JSON.stringify(updatedGroup), { status: 200 });
};
