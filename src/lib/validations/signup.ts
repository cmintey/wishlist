import { z } from "zod";

export const signupSchema = z.object({
	name: z.string().trim().min(1, "Name must not be blank"),
	username: z.string().trim().min(1, "Username must not be blank"),
	email: z.string().email(),
	password: z.string().regex(
		/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
		`Password must satisfy the following requirements:
            - At least 8 characters
            - 1 uppercase
            - 1 lowercase
            - 1 number
            - 1 special character (#?!@$%^&*-)
            `
	)
});
