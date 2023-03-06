import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
	const { user, session } = await locals.validateUser();

	if (!session) {
		throw redirect(302, "/login?ref=/wishlists/me");
	}

	throw redirect(302, `/wishlists/${user.username}`);
};
