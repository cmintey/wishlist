import { dev } from "$app/environment";
import { getRequestEvent } from "$app/server";
import pino from "pino";

export const logger = pino({
    level: "info",
    formatters: {
        level(label) {
            return { level: label.toUpperCase() };
        }
    },
    mixin() {
        return {
            ip: dev ? "localhost" : getRequestEvent().getClientAddress()
        };
    },
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime
});
