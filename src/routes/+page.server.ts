import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals, request }) => {
	const session = await locals.getSession();
	if (!session) {
		const path = new URL(request.url).pathname;
		throw redirect(302, `/login?ref=${path}`);
	}

	const users = await client.user.findMany({
		select: {
			username: true,
			firstname: true,
			lastname: true,
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
