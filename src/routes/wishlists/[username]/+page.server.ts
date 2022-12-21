import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals, params }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/wishlists/${params.username}`);
	}

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
					username: true,
					name: true
				}
			},
			pledgedBy: {
				select: {
					username: true,
					name: true
				}
			}
		}
	});

	const listOwner = await client.user.findUnique({
		where: {
			username: params.username
		},
		select: {
			name: true
		}
	});

	return {
		user,
		listOwner: {
			me: params.username === user.username,
			name: listOwner?.name
		},
		items: wishlistItems
	};
};
