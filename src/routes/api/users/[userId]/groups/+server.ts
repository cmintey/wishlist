import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import type { Group } from "@prisma/client";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.validate();

	if (!session) throw error(401, "user is not authenticated");
	if (params.userId !== session.user.userId && session.user.roleId !== Role.ADMIN)
		throw error(401, "not authorized");

	let groups: Group[];

	if (url.searchParams.get("active")) {
		const { group } = await client.userGroupMembership.findFirstOrThrow({
			where: {
				userId: params.userId,
				active: true
			},
			select: {
				group: true
			}
		});

		groups = [group];
	} else {
		const membership = await client.userGroupMembership.findMany({
			where: {
				userId: params.userId
			},
			select: {
				group: true
			}
		});

		groups = membership.map(({ group }) => group);
	}

	return new Response(JSON.stringify({ groups }));
};
