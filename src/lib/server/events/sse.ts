import type { SSEvent } from "$lib/schema";
import type EventEmitter from "node:events";
import type { Unsafe } from "sveltekit-sse";

type Writer = (eventName: string, data: string) => Unsafe<void, Error>;

export const subscribe = <T>(
    emit: Writer,
    emitter: EventEmitter,
    predicate?: (arg: T) => boolean,
    ...events: SSEvent[]
) => {
    const listeners: Record<string, (...args: any) => void> = {};

    for (const event of events) {
        const listener = (data: T) => {
            if (!predicate || (predicate && predicate(data))) {
                const { error } = emit(event, JSON.stringify(data));
                if (error) {
                    emitter.off(event, listener);
                }
            }
        };
        emitter.on(event, listener);
        listeners[event] = listener;
    }
    return function close() {
        Object.keys(listeners).forEach((evt) => {
            emitter.off(evt, listeners[evt]);
        });
    };
};
