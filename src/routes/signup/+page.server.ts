import { invalid, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import type { PageServerLoad, Actions } from "./$types";

// If the user exists, redirect authenticated users to the profile page.
export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (session) throw redirect(302, "/");
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const username = form.get("username");
		const password = form.get("password");
		console.log(username, password);

		// check for empty values
		if (!username || !password || typeof username !== "string" || typeof password !== "string") {
			return invalid(400);
		}

		try {
			const user = await auth.createUser("username", username, {
				password,
				attributes: {
					username
				}
			});
			console.log(user);
			const session = await auth.createSession(user.userId);
			locals.setSession(session);
		} catch (e) {
			// username already in use
			console.log(e);
			return invalid(400);
		}
	}
};
