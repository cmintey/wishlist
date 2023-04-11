import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { _authCheck } from "./users/[userId]/+server";
import { client } from "$lib/server/prisma";

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const { authenticated } = await _authCheck(locals.validateUser, params.groupId);

	if (!authenticated) {
		throw error(401, "User is not authorized to delete this group");
	}

	const group = await client.group.findUnique({
		where: {
			id: params.groupId
		}
	});

	if (!group) throw error(404, "Group does not exist");

	await client.userGroupMembership.deleteMany({
		where: {
			groupId: group.id
		}
	});

	const deletedGroup = await client.group.delete({
		where: {
			id: group.id
		}
	});

	return new Response(JSON.stringify(deletedGroup));
};
