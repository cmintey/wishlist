// https://github.com/sanrafa/sveltekit-sse-example/tree/main
import type EventEmitter from "node:events";
import type { BaseEventHandler } from "../../events";

export function createSSE(retry = 0) {
    const { readable, writable } = new TransformStream({
        start(ctr) {
            if (retry > 0) ctr.enqueue(`retry: ${retry}\n\n`);
        },
        transform({ event, data }, ctr) {
            let msg = data?.id ? `id: ${String(data.id)}\n` : ": hi\n\n";
            if (event) msg += `event: ${event}\n`;
            if (typeof data === "string") {
                msg += "data: " + data.trim().replace(/\n+/gm, "\ndata: ") + "\n\n";
            } else {
                msg += `data: ${JSON.stringify(data)}\n\n`;
            }
            ctr.enqueue(msg);
        }
    });

    const writer = writable.getWriter();

    return {
        readable,
        async subscribeToEvent<T>(emitter: EventEmitter, handler: BaseEventHandler<T, unknown>) {
            function listener(data: T) {
                if (handler.predicate(data)) {
                    writer.write({ event: handler.getEventId(), data: handler.handle(data) });
                }
            }
            emitter.on(handler.getEventId(), listener);
            await writer.closed.catch(() => {});
            emitter.off(handler.getEventId(), listener);
        }
    };
}
