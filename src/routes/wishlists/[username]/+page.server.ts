import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";
import type { Prisma } from "@prisma/client";
import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";

export const load: PageServerLoad = async ({ locals, params, depends, url }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/wishlists/${params.username}`);
	}
	const config = await getConfig();

	depends("list:poll");

	const activeMembership = await getActiveMembership(user);

	try {
		await client.userGroupMembership.findFirstOrThrow({
			where: {
				user: {
					username: params.username
				},
				groupId: activeMembership.groupId
			}
		});
	} catch {
		throw error(404, "user is not part of the group");
	}

	const search: Prisma.ItemWhereInput = {
		user: {
			username: params.username
		},
		group: {
			id: activeMembership.groupId
		}
	};

	if (config.suggestions.method === "approval" && params.username !== user.username) {
		search.approved = true;
	}

	if (config.suggestions.method === "surprise" && params.username === user.username) {
		search.addedBy = {
			username: user.username
		};
	}

	const filter = url.searchParams.get("filter");
	if (filter === "unclaimed") {
		search.pledgedById = null;
	} else if (filter === "claimed") {
		search.pledgedById = {
			not: null
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
			isMe: params.username === user.username,
			name: listOwner?.name
		},
		items: wishlistItems.filter((item) => item.approved),
		approvals: wishlistItems.filter((item) => !item.approved),
		suggestionsEnabled: config.suggestions.enable
	};
};
