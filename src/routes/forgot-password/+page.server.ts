import { sendPasswordReset, SMTP_ENABLED } from "$lib/server/email";
import { client } from "$lib/server/prisma";
import generateToken, { hashToken } from "$lib/server/token";
import { fail } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	return { smtpEnabled: SMTP_ENABLED };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const emailSchema = z.object({
			email: z.string().email()
		});

		const emailData = emailSchema.safeParse(formData);
		// check for empty values
		if (!emailData.success) {
			const errors = emailData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { error: true, errors });
		}

		const user = await client.user.findUnique({
			where: {
				email: emailData.data.email
			},
			select: {
				id: true,
				email: true
			}
		});

		let token = null;

		if (user) {
			token = await generateToken();

			await client.passwordReset.create({
				data: {
					userId: user.id,
					hashedToken: hashToken(token),
					expiresIn: 21600000 // 6 hours in milliseconds
				}
			});

			if (SMTP_ENABLED && user.email) {
				const sent = await sendPasswordReset(user.email, token);
				console.log(`email sent: ${sent}`);
			}
		}

		return { success: true, token };
	}
};
