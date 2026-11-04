import { dev } from "$app/env";
import { LOG_LEVEL } from "$app/env/private";
import pino from "pino";

async function resolveStream() {
    if (dev) {
        return await import("pino-pretty").then((m) => m.build({ colorize: true }));
    }
}

const stream = await resolveStream();

const options: pino.LoggerOptions<never, boolean> = {
    level: LOG_LEVEL,
    formatters: {
        level(label) {
            return { level: label.toUpperCase() };
        }
    },
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime
};

export const logger = pino(options, stream);

export const oidcLogger = logger.child({}, { msgPrefix: "[OIDC] " });
