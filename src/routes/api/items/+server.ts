import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { _authCheck } from "../groups/[groupId]/auth";

export const DELETE: RequestHandler = async ({ locals, request }) => {
    const groupId = new URL(request.url).searchParams.get("groupId");
    const claimed = new URL(request.url).searchParams.get("claimed");
    if (groupId) {
        const { authenticated } = await _authCheck(locals.validate, groupId);
        if (!authenticated) {
            error(401, "Not authorized to delete items for this group");
        }
    } else {
        const session = await locals.validate();
        if (!session) {
            error(401, "Must authenticate first");
        }
        if (session.user.roleId !== Role.ADMIN) {
            error(401, "Not authorized to delete items");
        }
    }

    try {
        const items = await client.item.deleteMany({
            where: {
                groupId: groupId ? groupId : undefined,
                pledgedById: claimed && Boolean(claimed) ? { not: null } : undefined
            }
        });
        return new Response(JSON.stringify(items), { status: 200 });
    } catch (e) {
        error(500, "Unable to delete items");
    }
};
