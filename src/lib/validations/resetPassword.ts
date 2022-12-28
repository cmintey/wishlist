import { z } from "zod";

export const resetPasswordSchema = z.object({
	oldPassword: z.string().min(1),
	newPassword: z.string().regex(
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
