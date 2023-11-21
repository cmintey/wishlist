import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { client } from "$lib/server/prisma";
import type { Prisma } from "@prisma/client";
import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";

export const load: PageServerLoad = async ({ locals, params, depends, url }) => {
	const session = await locals.validate();
	if (!session) {
		throw redirect(302, `/login?ref=/wishlists/${params.username}`);
	}

	depends("list:poll");

	const activeMembership = await getActiveMembership(session.user);
	const config = await getConfig(activeMembership.groupId);

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

	if (config.suggestions.method === "approval" && params.username !== session.user.username) {
		search.approved = true;
	}

	if (config.suggestions.method === "surprise" && params.username === session.user.username) {
		search.addedBy = {
			username: session.user.username
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

	const orderBy: Prisma.ItemOrderByWithRelationInput = {};
	const sort = url.searchParams.get("sort");
	const direction = url.searchParams.get("dir");
	if (sort === "price" && direction && (direction === "asc" || direction === "desc")) {
		orderBy.price = direction;
	}

	const wishlistItems = await client.item.findMany({
		where: search,
		orderBy,
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

	const listOwner = await client.user.findUniqueOrThrow({
		where: {
			username: params.username
		},
		select: {
			name: true,
			id: true
		}
	});

	return {
		user: session.user,
		listOwner: {
			isMe: params.username === session.user.username,
			...listOwner
		},
		items: wishlistItems.filter((item) => item.approved),
		approvals: wishlistItems.filter((item) => !item.approved),
		suggestionsEnabled: config.suggestions.enable
	};
};
