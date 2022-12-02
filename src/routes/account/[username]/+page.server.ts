import { client } from "$lib/server/prisma";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, request }) => {
	const { session, user } = await locals.getSessionUser();
	if (!session) {
		const path = new URL(request.url).pathname;
		throw redirect(302, `/login?ref=${path}`);
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
