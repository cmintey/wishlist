import type { SSEvent } from "$lib/schema";
import { EventEmitter } from "node:events";

export const itemEmitter = new EventEmitter();

export const emitEvent = (type: SSEvent, data: Record<string, unknown> | undefined = undefined) => {
    return data ? itemEmitter.emit(type, data) : itemEmitter.emit(type);
};
