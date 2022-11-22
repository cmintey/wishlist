import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) throw redirect(302, "/login");

	const users = await client.user.findMany({
		select: {
			username: true,
			myItems: true,
			_count: {
				select: {
					myItems: {
						where: {
							pledgedBy: {
								isNot: null
							}
						}
					}
				}
			}
		}
	});
	return {
		users
	};
};
