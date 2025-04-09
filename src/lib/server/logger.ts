import { dev } from "$app/environment";
import pino from "pino";

export const logger = pino({
    level: "info",
    formatters: {
        level(label) {
            return { level: label.toUpperCase() };
        }
    },
    transport: dev
        ? {
              target: "pino-pretty",
              options: {
                  colorize: true
              }
          }
        : undefined,
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime
});
