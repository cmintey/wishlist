import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import type { UserGroupMembership } from "@prisma/client";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.validate();

	if (!session) throw error(401, "user is not authenticated");
	if (params.userId !== session.user.userId && session.user.roleId !== Role.ADMIN)
		throw error(401, "not authorized");

	const data = await request.json();

	if (data.active) {
		const activeMembership = await client.userGroupMembership.findFirst({
			where: {
				userId: params.userId,
				active: true
			}
		});

		let membership: UserGroupMembership;
		try {
			membership = await client.userGroupMembership.findFirstOrThrow({
				where: {
					groupId: params.groupId,
					userId: params.userId
				}
			});
		} catch {
			throw error(400, "user is not a member of the group");
		}

		if (activeMembership?.id === membership.id) throw error(400, "group is already active");

		membership = await client.userGroupMembership.update({
			where: {
				id: membership.id
			},
			data: {
				active: true
			}
		});

		if (activeMembership) {
			await client.userGroupMembership.update({
				where: {
					id: activeMembership.id
				},
				data: {
					active: false
				}
			});
		}

		return new Response(JSON.stringify({ membership }));
	}

	return new Response();
};
