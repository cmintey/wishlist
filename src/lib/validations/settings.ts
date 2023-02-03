import { z } from "zod";

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
