import pino from "pino";

export const logger = pino({
    level: "info",
    formatters: {
        level(label) {
            return { level: label.toUpperCase() };
        }
    },
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime
});
