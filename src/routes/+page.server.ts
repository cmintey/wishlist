import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";

export const load = (async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login`);
	}

	const activeMembership = await client.userGroupMembership.findFirstOrThrow({
		where: {
			userId: user.userId,
			active: true
		}
	});

	const me = await client.user.findUniqueOrThrow({
		select: {
			name: true,
			username: true,
			picture: true,
			items: {
				select: {
					id: true
				},
				where: {
					addedBy: {
						username: user.username
					},
					groupId: activeMembership.groupId
				}
			},
			_count: {
				select: {
					items: {
						where: {
							approved: false,
							groupId: activeMembership.groupId
						}
					}
				}
			}
		},
		where: {
			username: user.username
		}
	});

	const users = await client.user.findMany({
		where: {
			username: {
				not: user.username
			},
			UserGroupMembership: {
				some: {
					group: {
						id: activeMembership.groupId
					}
				}
			}
		},
		select: {
			username: true,
			name: true,
			picture: true,
			items: {
				select: {
					id: true
				},
				where: {
					groupId: activeMembership.groupId
				}
			},
			_count: {
				select: {
					items: {
						where: {
							pledgedById: {
								not: null
							},
							approved: true,
							groupId: activeMembership.groupId
						}
					}
				}
			}
		}
	});
	return {
		me,
		users
	};
}) satisfies PageServerLoad;
