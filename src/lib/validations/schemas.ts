import { z } from "zod";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import { loadOptions } from "$lib/validations/zxcvbn";

await loadOptions().then((options) => zxcvbnOptions.setOptions(options));

const passwordZxcvbn = z.string().refine((pass) => zxcvbn(pass).score > 2, {
	message: "Password must be at least 'moderate'"
});

export const signupSchema = z.object({
	name: z.string().trim().min(1, "Name must not be blank"),
	username: z.string().trim().min(1, "Username must not be blank"),
	email: z.string().email(),
	password: passwordZxcvbn
});

export const loginSchema = z.object({
	username: z.string().trim().min(1, "Username must not be blank"),
	password: z.string().min(1, "Password must not be blank")
});

export const resetPasswordSchema = z.object({
	oldPassword: z.string().min(1),
	newPassword: passwordZxcvbn
});

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
	smtpFromName: z.string().optional()
});
