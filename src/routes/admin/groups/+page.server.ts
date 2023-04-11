import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/admin/groups`);
	}
	if (user.roleId !== Role.ADMIN) {
		throw error(401, "Not authorized to view admin panel");
	}

	const groups = client.group
		.findMany({
			select: {
				id: true,
				name: true,
				_count: {
					select: {
						UserGroupMembership: true
					}
				}
			}
		})
		.then((groups) =>
			groups.map((group) => ({ userCount: group._count.UserGroupMembership, ...group }))
		);

	return {
		groups
	};
};
