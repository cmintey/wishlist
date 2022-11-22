import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals, params }) => {
	const { session, user } = await locals.getSessionUser();
	if (!session) throw redirect(302, "/login");

	const search = {
		user: {
			username: params.username
		}
	};

	if (params.username === user.username) {
		// @ts-ignore
		search.addedBy = {
			username: user.username
		};
	}

	const wishlistItems = await client.item.findMany({
		where: search,
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
			}
		}
	});

	return {
		user,
		items: wishlistItems
	};
};
