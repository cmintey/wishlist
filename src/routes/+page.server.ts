import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.getSessionUser();
	if (!session) {
		throw redirect(302, `/login`);
	}

	const me = await client.user.findUnique({
		select: {
			name: true,
			username: true,
			myItems: {
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
			myItems: true,
			_count: {
				select: {
					myItems: {
						where: {
							pledgedBy: {
								isNot: null
							},
							addedBy: {
								username: user.username
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
