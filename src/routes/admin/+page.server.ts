import { Role } from "$lib/schema";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/admin`);
	}
	if (user.roleId !== Role.ADMIN) {
		throw error(401, "Not authorized to view admin panel");
	}

	throw redirect(302, "/admin/users");
};
