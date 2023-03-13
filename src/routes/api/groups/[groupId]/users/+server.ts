import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ locals, request, params }) => {
	const session = await locals.validate();
	if (!session) {
		throw error(401, "Must authenticate first");
	}

	let group;

	try {
		group = await client.group.findUniqueOrThrow({
			where: {
				id: params.groupId
			}
		});
	} catch {
		throw error(404, "group not found");
	}

	const data = await request.json();

	if (!data.userId) throw error(400, "must specify user id in body");

	let membership = await client.userGroupMembership.findFirst({
		where: {
			userId: data.userId,
			groupId: group.id
		}
	});

	if (membership) throw error(400, "user is already member of the group");

	membership = await client.userGroupMembership.create({
		data: {
			userId: data.userId,
			groupId: group.id
		}
	});

	return new Response(JSON.stringify({ membership }), { status: 201 });
};
