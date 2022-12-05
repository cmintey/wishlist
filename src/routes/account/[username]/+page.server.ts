import { client } from "$lib/server/prisma";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	const { session, user } = await locals.getSessionUser();
	if (!session) {
		throw redirect(302, `/login?ref=/account/${params.username}`);
	}

	const role = await client.role.findUnique({
		where: {
			id: user.roleId
		},
		select: {
			name: true
		}
	});

	if (role?.name !== "ADMIN") {
		throw error(401, "Not authorized to view this page");
	}
};
