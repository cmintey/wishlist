import { SSEvents } from "$lib/schema";
import { itemEmitter } from "$lib/server/events/emitters";
import { createSSE } from "$lib/server/events/sse";
import type { Item } from "@prisma/client";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";

export const GET = (async ({ params }) => {
    // TODO:  This endpoint should only be accessible to public users who are not signed in and has a valid public id

    const list = await client.publicList.findUnique({
        select: {
            userId: true,
            groupId: true
        },
        where: {
            id: params.id
        }
    });
    if (!list) {
        error(404, "Public list not found");
    }

    const config = await getConfig(list.groupId);
    if (config.listMode !== "registry") {
        return new Response();
    }

    const predicate = (item: Item) => {
        return list.groupId === item.groupId && list.userId === item.userId;
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
