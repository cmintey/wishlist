import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, params }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/admin/groups/${params.groupId}`);
	}
	if (user.roleId != Role.ADMIN) {
		throw error(401, "Not authorized to view admin panel");
	}

	const group = client.group
		.findUniqueOrThrow({
			where: {
				id: params.groupId
			},
			select: {
				id: true,
				name: true,
				UserGroupMembership: {
					select: {
						user: {
							select: {
								id: true,
								username: true,
								name: true,
								email: true,
								role: {
									select: {
										id: true
									}
								}
							}
						}
					}
				}
			}
		})
		.then((group) => ({
			id: group?.id,
			name: group?.name,
			users: group?.UserGroupMembership.map((membership) => ({
				...membership.user,
				isAdmin: membership.user.role.id === Role.ADMIN
			}))
		}));

	return {
		group,
		user: {
			isAdmin: true,
			...user
		},
		config: getConfig()
	};
}) satisfies PageServerLoad;
