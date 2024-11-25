import { SSEvent } from "$lib/schema";
import { itemEmitter } from "$lib/server/events/emitters";
import { subscribe } from "$lib/server/events/sse";
import type { Item } from "@prisma/client";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";
import { produce } from "sveltekit-sse";

export const POST = (async ({ locals, params }) => {
    if (!locals.user) {
        error(401, "Unauthorized");
    }

    const [wishlistUser, activeGroup] = await Promise.all([
        client.user.findUniqueOrThrow({
            select: {
                id: true
            },
            where: {
                username: params.username
            }
        }),
        client.userGroupMembership.findFirstOrThrow({
            select: {
                groupId: true
            },
            where: {
                userId: locals.user.id,
                active: true
            }
        })
    ]);

    const config = await getConfig(activeGroup.groupId);
    if (
        config.suggestions.enable &&
        config.suggestions.method === "surprise" &&
        params.username === locals.user.username
    ) {
        return new Response();
    }

    const predicate = (item: Item | undefined) => {
        if (item) {
            return activeGroup.groupId === item.groupId && wishlistUser.id === item.userId;
        }
        return params.username !== locals.user?.username;
    };

    return produce(({ emit }) => {
        return subscribe(
            emit,
            itemEmitter,
            predicate,
            SSEvent.ItemCreate,
            SSEvent.ItemUpdate,
            SSEvent.ItemDelete,
            SSEvent.ItemsUpdate
        );
    });
}) satisfies RequestHandler;
