import { z } from "zod";

export const signupSchema = z.object({
	firstname: z.string().trim().min(1, "First Name must not be blank"),
	lastname: z.string().trim().min(1, "Last Name must not be blank"),
	username: z.string().trim().min(1, "Username must not be blank"),
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
