import { auth } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { signupSchema } from "$lib/validations/signup";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { hashToken } from "$lib/server/token";
import config from "$lib/server/config";

export const load: PageServerLoad = async ({ locals, request }) => {
	// If the user session exists, redirect authenticated users to the profile page.
	const session = await locals.validate();
	if (session) throw redirect(302, "/");

	const token = new URL(request.url).searchParams.get("token");
	if (!config.enableSignup) {
		if (token) {
			const signup = await client.signupToken.findFirst({
				where: {
					hashedToken: hashToken(token),
					redeemed: false
				},
				select: {
					id: true,
					createdAt: true,
					expiresIn: true
				}
			});

			if (!signup) throw error(400, "reset token not found");

			const createdAt = signup.createdAt;
			const expiry = createdAt.getTime() + signup.expiresIn;
			if (expiry - Date.now() > 0) {
				return { valid: true, id: signup.id };
			}
			throw error(400, "Invite code is either invalid or already been used");
		}
		throw error(404, "This instance is invite only");
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = Object.fromEntries(await request.formData());
		const signupData = signupSchema.safeParse(formData);

		// check for empty values
		if (!signupData.success) {
			const errors = signupData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { error: true, errors });
		}

		const userCount = await client.user.count();

		try {
			const user = await auth.createUser({
				key: {
					providerId: "username",
					providerUserId: signupData.data.username,
					password: signupData.data.password
				},
				attributes: {
					username: signupData.data.username,
					email: signupData.data.email,
					name: signupData.data.name,
					roleId: userCount > 0 ? 1 : 2
				}
			});
			const session = await auth.createSession(user.userId);
			locals.setSession(session);
		} catch (e) {
			return fail(400, {
				error: true,
				errors: [{ field: "username", message: "User with username or email already exists" }]
			});
		}
	}
};
