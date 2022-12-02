import { z } from "zod";

export const loginSchema = z.object({
	username: z.string().trim().min(1, "Username must not be blank"),
	password: z.string().min(1, "Password must not be blank")
});
