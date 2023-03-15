import { client } from "$lib/server/prisma";
import type { User } from "@prisma/client";
import { type RequestHandler, error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.validate();

	if (!session) throw error(401, "user is not authenticated");

	let users: User[] = [];

	users = await client.user.findMany({
		where: {
			name: {
				contains: url.searchParams.get("name") || undefined
			}
		}
	});

	return new Response(JSON.stringify(users));
};
