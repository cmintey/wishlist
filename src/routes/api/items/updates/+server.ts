import { SSEvents } from "$lib/schema";
import { itemEmitter } from "$lib/server/events/emitters";
import { createSSE } from "$lib/server/events/sse";
import type { RequestHandler } from "./$types";

export const GET = (async () => {
    const { readable, subscribeToEvent } = createSSE();
    subscribeToEvent(itemEmitter, SSEvents.item.update);
    subscribeToEvent(itemEmitter, SSEvents.item.create);
    subscribeToEvent(itemEmitter, SSEvents.item.delete);
    return new Response(readable, {
        headers: {
            "cache-control": "no-cache",
            "content-type": "text/event-stream"
        }
    });
}) satisfies RequestHandler;
