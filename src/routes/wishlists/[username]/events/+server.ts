import { SSEvents } from "$lib/schema";
import { itemEmitter } from "$lib/server/events/emitters";
import { createSSE } from "$lib/server/events/sse";
import type { Item } from "@prisma/client";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";

export const GET = (async ({ locals, params }) => {
    const session = await locals.validate();
    if (!session) {
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
                userId: session.user.userId,
                active: true
            }
        })
    ]);

    const config = await getConfig(activeGroup.groupId);
    if (
        config.suggestions.enable &&
        config.suggestions.method === "surprise" &&
        params.username === session.user.username
    ) {
        return new Response();
    }

    const predicate = (item: Item) => {
        const b = activeGroup.groupId === item.groupId && wishlistUser.id === item.userId;
        return b;
    };

    const { readable, subscribeToEvent } = createSSE<Item>();

    subscribeToEvent(itemEmitter, SSEvents.item.update, predicate);
    subscribeToEvent(itemEmitter, SSEvents.item.create, predicate);
    subscribeToEvent(itemEmitter, SSEvents.item.delete, predicate);

    return new Response(readable, {
        headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no"
        }
    });
}) satisfies RequestHandler;
