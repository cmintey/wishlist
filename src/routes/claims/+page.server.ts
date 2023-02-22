import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/claims`);
	}

	const wishlistItems = await client.item.findMany({
		where: {
			pledgedBy: {
				username: user.username
			}
		},
		include: {
			addedBy: {
				select: {
					username: true,
					name: true
				}
			},
			pledgedBy: {
				select: {
					username: true,
					name: true
				}
			},
			user: {
				select: {
					username: true,
					name: true
				}
			}
		}
	});

	return {
		user,
		items: wishlistItems
	};
};
