import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login`);
	}

	const me = await client.user.findUniqueOrThrow({
		select: {
			name: true,
			username: true,
			items: {
				select: {
					id: true
				},
				where: {
					addedBy: {
						username: user.username
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
			}
		},
		select: {
			username: true,
			name: true,
			items: {
				select: {
					id: true
				}
			},
			_count: {
				select: {
					items: {
						where: {
							pledgedById: {
								not: null
							}
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
};
