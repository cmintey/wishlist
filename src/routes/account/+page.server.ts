import { client } from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, request }) => {
	const { session, user } = await locals.getSessionUser();
	if (!session) {
		const path = new URL(request.url).pathname;
		throw redirect(302, `/login?ref=${path}`);
	}

	const users = await client.user.findMany({
		select: {
			username: true,
			role: {
				select: {
					name: true
				}
			}
		}
	});

	const role = await client.role.findUnique({
		where: {
			id: user.roleId
		},
		select: {
			name: true
		}
	});

	return {
		user: {
			...user,
			role
		},
		users
	};
};
