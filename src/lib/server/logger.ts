import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import pino from "pino";

const transport = dev
    ? {
          target: "pino-pretty",
          options: {
              colorize: true
          }
      }
    : undefined;

export const logger = pino({
    level: env.LOG_LEVEL ?? "info",
    formatters: {
        level(label) {
            return { level: label.toUpperCase() };
        }
    },
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    transport
});

export const oidcLogger = logger.child({}, { msgPrefix: "[OIDC] " });
