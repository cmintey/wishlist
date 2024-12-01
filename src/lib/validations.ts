import { z } from "zod";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import { loadOptions, meterLabel } from "$lib/zxcvbn";
import { getConfig } from "./server/config";

await loadOptions().then((options) => zxcvbnOptions.setOptions(options));

const passwordZxcvbn = (minScore: number) => {
    return z
        .string()
        .min(1, "Password must not be blank")
        .refine((pass) => zxcvbn(pass).score >= minScore, {
            message: `Password must be at least '${meterLabel[minScore]}'`
        });
};

export const loginSchema = z.object({
    username: z.string().trim().min(1, "Username must not be blank"),
    password: z.string().min(1, "Password must not be blank")
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
        name: z.string().trim().min(1, "Name must not be blank"),
        username: z.string().trim().min(1, "Username must not be blank"),
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
    passwordStrength: z.coerce.number().min(-1).max(5).default(2)
});

export const publicListCreateSchema = z.object({
    groupId: z.string()
});
