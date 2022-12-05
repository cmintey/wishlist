import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals, params, request }) => {
	const { session, user } = await locals.getSessionUser();
	if (!session) {
		const path = new URL(request.url).pathname;
		throw redirect(302, `/login?ref=${path}`);
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
			name: listOwner.name
		},
		items: wishlistItems
	};
};
