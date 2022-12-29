import { sendSignupLink, SMTP_ENABLED } from "$lib/server/email";
import { client } from "$lib/server/prisma";
import generateToken, { hashToken } from "$lib/server/token";
import { error, fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/admin`);
	}
	if (user.roleId != 2) {
		throw error(401, "Not authorized to view admin panel");
	}

	const users = await client.user.findMany({
		select: {
			username: true,
			name: true,
			role: {
				select: {
					name: true
				}
			}
		}
	});

	return { user, users, smtpEnabled: SMTP_ENABLED };
};

export const actions: Actions = {
	"invite-user": async ({ url, request }) => {
		const token = await generateToken();
		const tokenUrl = new URL(`/signup?token=${token}`, url);

		if (!SMTP_ENABLED) {
			await client.signupToken.create({
				data: {
					hashedToken: hashToken(token),
					expiresIn: 21600000 // 6 hours in milliseconds
				}
			});

			return { success: true, url: tokenUrl.href };
		}

		const formData = Object.fromEntries(await request.formData());
		const schema = z.object({
			"invite-email": z.string().email()
		});

		const emailData = schema.safeParse(formData);

		if (!emailData.success) {
			const errors = emailData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { error: true, errors });
		}

		await client.signupToken.create({
			data: {
				hashedToken: hashToken(token),
				expiresIn: 21600000 // 6 hours in milliseconds
			}
		});

		const sent = await sendSignupLink(emailData.data["invite-email"], tokenUrl.href);
		console.log(`email sent: ${sent}`);
		return { success: true, url: null };
	}
};
