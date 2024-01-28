// https://github.com/sanrafa/sveltekit-sse-example/tree/main
import type EventEmitter from "node:events";

export function createSSE<T>(retry = 0) {
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
        async subscribeToEvent(emitter: EventEmitter, event: string, predicate?: (arg: T) => boolean) {
            function listener(data: T) {
                if (!predicate || (predicate && predicate(data))) {
                    writer.write({ event, data });
                }
            }
            emitter.on(event, listener);
            await writer.closed.catch((e) => {
                if (e) console.error(e);
            });
            emitter.off(event, listener);
        }
    };
}
