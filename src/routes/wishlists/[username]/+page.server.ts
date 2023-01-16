import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";
import { env } from "$env/dynamic/private";
import type { Prisma } from "@prisma/client";

export const load: PageServerLoad = async ({ locals, params, depends }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/wishlists/${params.username}`);
	}

	depends("list:poll");

	const suggestionMethod = env.SUGGESTION_METHOD as SuggestionMethod;

	const search: Prisma.ItemWhereInput = {
		user: {
			username: params.username
		}
	};

	if (suggestionMethod === "approval" && params.username !== user.username) {
		search.approved = true;
	}

	if (suggestionMethod === "surprise") {
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
			},
			user: {
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
		items: wishlistItems.filter((item) => item.approved),
		approvals: wishlistItems.filter((item) => !item.approved),
		suggestionsEnabled: env.ALLOW_SUGGESTIONS === "true"
	};
};
