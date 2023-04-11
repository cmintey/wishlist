import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const { user, session } = await locals.validateUser();

	if (!session) {
		throw redirect(302, "/login?ref=/wishlists/me");
	}

	throw redirect(302, `/wishlists/${user.username}`);
};
