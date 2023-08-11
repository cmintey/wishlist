import { Role } from "$lib/schema";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(302, `/login?ref=/admin`);
	}
	if (session.user.roleId !== Role.ADMIN) {
		throw error(401, "Not authorized to view admin panel");
	}

	throw redirect(302, `${url.pathname}/members`);
};
