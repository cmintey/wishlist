import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import type { PageServerLoad, Actions } from "./$types";
import { signupSchema } from "$lib/validations/signup";
import { client } from "$lib/server/prisma";

// If the user exists, redirect authenticated users to the profile page.
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (session) throw redirect(302, "/");
	return {};
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
			const user = await auth.createUser("username", signupData.data.username, {
				password: signupData.data.password,
				attributes: {
					username: signupData.data.username,
					name: signupData.data.name,
					roleId: userCount > 0 ? 1 : 2
				}
			});
			const session = await auth.createSession(user.userId);
			locals.setSession(session);
		} catch (e) {
			return fail(400, {
				error: true,
				errors: [{ field: "username", message: "User with username already exists" }]
			});
		}
	}
};
