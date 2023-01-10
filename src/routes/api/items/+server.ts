import { client } from "$lib/server/prisma";
import { error, type RequestHandler } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw error(401, "Must authenticate first");
	}
	if (user.roleId != 2) {
		throw error(401, "Not authorized to view admin panel");
	}

	try {
		const items = await client.item.deleteMany();
		return new Response(JSON.stringify(items), { status: 200 });
	} catch (e) {
		throw error(500, "Unable to delete items");
	}
};
