import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ locals, request }) => {
	const session = await locals.validate();
	if (!session) {
		throw error(401, "Must authenticate first");
	}

	const data = await request.json();

	if (!data.name) throw error(400, "must specify group name in body");

	const group = await client.group.create({
		data: {
			name: data.name
		}
	});

	return new Response(JSON.stringify({ group }), { status: 201 });
};
