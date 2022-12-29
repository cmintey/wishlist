import { auth } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { resetPasswordSchema } from "$lib/validations/resetPassword";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/account`);
	}

	return {
		user
	};
};

export const actions: Actions = {
	namechange: async ({ request, locals }) => {
		const { user, session } = await locals.validateUser();
		if (!session) throw redirect(302, "/login?ref=/account");

		const formData = Object.fromEntries(await request.formData());
		const schema = z.object({
			name: z.string().trim().min(1, "Name must not be blank")
		});
		const nameData = schema.safeParse(formData);
		// check for empty values
		if (!nameData.success) {
			const errors = nameData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { error: true, errors });
		}

		await client.user.update({
			data: {
				name: nameData.data.name
			},
			where: {
				username: user.username
			}
		});
	},

	passwordchange: async ({ request, locals }) => {
		const { user, session } = await locals.validateUser();
		if (!session) throw redirect(302, "/login?ref=/account");

		const formData = Object.fromEntries(await request.formData());
		const pwdData = resetPasswordSchema.safeParse(formData);

		if (!pwdData.success) {
			const errors = pwdData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { error: true, errors });
		}

		try {
			await auth.authenticateUser("username", user.username, pwdData.data.oldPassword);
		} catch {
			return fail(400, {
				error: true,
				errors: [{ field: "currentPassword", message: "Incorrect password" }]
			});
		}

		const u = await auth.updateUserPassword(user.userId, pwdData.data.newPassword);
		const newSession = await auth.createSession(u.userId);
		locals.setSession(newSession);
	}
};
