import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { _authCheck } from "../groups/[groupId]/auth";
import { tryDeleteImage } from "$lib/server/image-util";

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
        const items = await client.item.findMany({
            select: {
                id: true,
                image_url: true
            },
            where: {
                groupId: groupId ? groupId : undefined,
                pledgedById: claimed && Boolean(claimed) ? { not: null } : undefined
            }
        });

        for (const item of items) {
            if (item.image_url) {
                await tryDeleteImage(item.image_url)
            }
        }

        const deletedItems = await client.item.deleteMany({
            where: {
                id: {
                    in: items.map(item => item.id)
                }
            }
        })

        return new Response(JSON.stringify(deletedItems), { status: 200 });
    } catch (e) {
        error(500, "Unable to delete items");
    }
};
