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

	const userGroupRoleId = await client.userGroupMembership.findFirst({
		where: {
			userId: user.userId,
			groupId: params.groupId
		},
		select: {
			roleId: true
		}
	});

	if (!(user.roleId === Role.ADMIN || userGroupRoleId?.roleId === Role.GROUP_MANAGER)) {
		throw error(401, "Not authorized to view admin panel");
	}

	const group = await client.group
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
						},
						roleId: true
					}
				}
			}
		})
		.then((group) => ({
			id: group?.id,
			name: group?.name,
			users: group?.UserGroupMembership.map((membership) => ({
				...membership.user,
				isGroupManager: membership.roleId === Role.GROUP_MANAGER
			}))
		}));

	return {
		group,
		user: {
			isAdmin: true,
			...user
		},
		config: getConfig(group.id)
	};
}) satisfies PageServerLoad;
