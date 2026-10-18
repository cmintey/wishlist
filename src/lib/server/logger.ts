import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import pino from "pino";

async function resolveStream() {
    if (dev) {
        return await import("pino-pretty").then((m) => m.build({ colorize: true }));
    }
}

const stream = await resolveStream();

const options: pino.LoggerOptions<never, boolean> = {
    level: env.LOG_LEVEL ?? "info",
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
