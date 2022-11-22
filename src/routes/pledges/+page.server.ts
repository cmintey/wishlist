import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.getSessionUser();
	if (!session) throw redirect(302, "/login");

	const wishlistItems = await client.item.findMany({
		where: {
			pledgedBy: {
				username: user.username
			}
		},
		include: {
			addedBy: {
				select: {
					username: true
				}
			},
			pledgedBy: {
				select: {
					username: true
				}
			},
			user: {
				select: {
					username: true
				}
			}
		}
	});

	return {
		user,
		items: wishlistItems
	};
};
