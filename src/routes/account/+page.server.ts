import { client } from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.getSessionUser();
	if (!session) {
		throw redirect(302, `/login?ref=/account`);
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
