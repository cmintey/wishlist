import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const authCheck = async (validateUser: App.Locals["validateUser"], groupId: string) => {
	const { session, user: sessionUser } = await validateUser();
	if (!session) {
		throw error(401, "Must authenticate first");
	}

	const user = await client.user.findFirstOrThrow({
		where: {
			id: sessionUser.userId
		},
		select: {
			roleId: true,
			UserGroupMembership: {
				where: {
					groupId: groupId
				},
				select: {
					roleId: true
				}
			}
		}
	});

	return {
		authenticated:
			user.roleId === Role.ADMIN || user.UserGroupMembership[0]?.roleId === Role.GROUP_MANAGER,
		user
	};
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
	const { authenticated } = await authCheck(locals.validateUser, params.groupId);

	if (!authenticated) {
		throw error(401, "User is not authorized to add a member to this group");
	}

	const group = await client.group.findUniqueOrThrow({
		where: {
			id: params.groupId
		}
	});
	if (!group) throw error(404, "group not found");

	const data = await request.json();

	let membership = await client.userGroupMembership.findFirst({
		where: {
			userId: params.userId,
			groupId: group.id
		}
	});

	if (membership) throw error(400, "user is already member of the group");

	membership = await client.userGroupMembership.create({
		data: {
			userId: params.userId,
			groupId: group.id,
			roleId: data.manager ? Role.GROUP_MANAGER : undefined
		}
	});

	return new Response(JSON.stringify({ membership }), { status: 201 });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const { authenticated } = await authCheck(locals.validateUser, params.groupId);

	if (!authenticated) {
		throw error(401, "User is not authorized to add a member to this group");
	}

	const group = await client.group.findUniqueOrThrow({
		where: {
			id: params.groupId
		}
	});
	if (!group) throw error(404, "group not found");

	let membership = await client.userGroupMembership.findFirstOrThrow({
		where: {
			userId: params.userId,
			groupId: group.id
		}
	});

	if (!membership) throw error(400, "user is not a member of the group");

	membership = await client.userGroupMembership.delete({
		where: {
			id: membership.id
		}
	});

	return new Response(JSON.stringify({ membership }), { status: 200 });
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const { authenticated } = await authCheck(locals.validateUser, params.groupId);

	if (!authenticated) {
		throw error(401, "User is not authorized to add a member to this group");
	}

	const group = await client.group.findUniqueOrThrow({
		where: {
			id: params.groupId
		}
	});
	if (!group) throw error(404, "group not found");

	let membership = await client.userGroupMembership.findFirstOrThrow({
		where: {
			userId: params.userId,
			groupId: group.id
		}
	});

	if (!membership) throw error(400, "user is not a member of the group");

	const body = await request.json();
	const data: {
		roleId?: number;
	} = {};

	if (Object.keys(body).includes("manager") && typeof body.manager === "boolean")
		data.roleId = body.manager ? Role.GROUP_MANAGER : Role.USER;

	membership = await client.userGroupMembership.update({
		where: {
			id: membership.id
		},
		data
	});

	return new Response(JSON.stringify({ membership }), { status: 200 });
};