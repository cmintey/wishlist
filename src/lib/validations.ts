import { z } from "zod";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import { loadOptions, meterLabel } from "$lib/zxcvbn";
import { getConfig } from "./server/config";
import { getFormatter } from "./i18n";

await loadOptions().then((options) => zxcvbnOptions.setOptions(options));
const $t = await getFormatter();

const passwordZxcvbn = (minScore: number) => {
    const minStrength = $t(meterLabel[minScore]);
    const message = $t("errors.password-min-strength", { values: { minStrength } });
    return z
        .string()
        .min(1, $t("errors.password-must-not-be-blank"))
        .refine((pass) => zxcvbn(pass).score >= minScore, { message });
};

export const loginSchema = z.object({
    username: z.string().trim().min(1, $t("errors.username-must-not-be-blank")),
    password: z.string().min(1, $t("errors.password-must-not-be-blank"))
});

export const getResetPasswordSchema = async () => {
    const { security } = await getConfig();
    return z.object({
        oldPassword: z.string().min(1),
        newPassword: passwordZxcvbn(security.passwordStrength),
        invalidateSessions: z.coerce.boolean().default(false)
    });
};

export const getSignupSchema = async () => {
    const { security } = await getConfig();
    return z.object({
        name: z.string().trim().min(1, $t("errors.name-must-not-be-blank")),
        username: z.string().trim().min(1, $t("errors.username-must-not-be-blank")),
        email: z.string().email(),
        password: passwordZxcvbn(security.passwordStrength),
        tokenId: z.string().optional()
    });
};

export const settingSchema = z.object({
    enableSignup: z.coerce.boolean().default(false),
    enableSuggestions: z.coerce.boolean().default(false),
    suggestionMethod: z.enum(["surprise", "auto-approval", "approval"]).default("approval"),
    enableSMTP: z.coerce.boolean().default(false),
    smtpHost: z.string().optional(),
    smtpPort: z.coerce.number().optional(),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),
    smtpFrom: z.string().optional(),
    smtpFromName: z.string().optional(),
    claimsShowName: z.coerce.boolean().default(false),
    listMode: z.enum(["standard", "registry"]).default("standard"),
    passwordStrength: z.coerce.number().min(-1).max(5).default(2),
    defaultGroup: z.string().optional()
});

export const publicListCreateSchema = z.object({
    groupId: z.string()
});
