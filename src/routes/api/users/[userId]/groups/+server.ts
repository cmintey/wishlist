import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import type { Group, Role as RoleModel } from "@prisma/client";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.validate();

	if (!session) throw error(401, "user is not authenticated");
	if (params.userId !== session.user.userId && session.user.roleId !== Role.ADMIN)
		throw error(401, "not authorized");

	let groups: GroupInformation[];

	if (url.searchParams.get("active")) {
		const membership = await client.userGroupMembership.findFirstOrThrow({
			where: {
				userId: params.userId,
				active: true
			},
			select: {
				group: true,
				active: true,
				role: true
			}
		});

		groups = [toGroupInformation(membership)];
	} else {
		const membership = await client.userGroupMembership.findMany({
			where: {
				userId: params.userId
			},
			select: {
				group: true,
				active: true,
				role: true
			}
		});

		groups = membership.map(toGroupInformation);
	}

	return new Response(JSON.stringify({ groups }));
};

const toGroupInformation = (membership: {
	group: Group;
	active: boolean;
	role: RoleModel;
}): GroupInformation => {
	return {
		...membership.group,
		active: membership.active,
		isManager: membership.role.id === Role.GROUP_MANAGER || membership.role.id === Role.ADMIN
	};
};
