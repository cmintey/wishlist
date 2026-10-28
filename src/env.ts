import { defineEnvVars } from "@sveltejs/kit/env";
import type { LevelWithSilent } from "pino";
import z from "zod";

const LEVELS: LevelWithSilent[] = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;

export const variables = defineEnvVars({
    HEADER_AUTH_ENABLED: {
        schema: z.string().pipe(z.stringbool()).default(false)
    },
    HEADER_USERNAME: { schema: z.string().optional() },
    HEADER_EMAIL: { schema: z.string().optional() },
    HEADER_NAME: { schema: z.string().optional() },
    http_proxy: { schema: z.string().optional() },
    HTTP_PROXY: { schema: z.string().optional() },
    https_proxy: { schema: z.string().optional() },
    HTTPS_PROXY: { schema: z.string().optional() },
    PUBLIC_DEFAULT_CURRENCY: {
        public: true,
        schema: z
            .string()
            .pipe(z.enum(Intl.supportedValuesOf("currency")))
            .default("USD")
    },
    ORIGIN: { schema: z.url() },
    MAX_IMAGE_SIZE: { schema: z.string().pipe(z.coerce.number()).default(5000000) },
    LOG_LEVEL: { schema: z.string().pipe(z.enum(LEVELS)).default("info") },
    DATABASE_URL: { schema: z.url() },
    ALLOWED_IPS: {
        schema: z
            .string()
            .transform((input) => input.split(",").map((i) => i.trim()))
            .pipe(z.array(z.union([z.ipv4(), z.ipv6(), z.cidrv4(), z.cidrv6()])))
            .default([])
    },
    TOKEN_TIME: { schema: z.string().pipe(z.coerce.number()).default(72) }
});
