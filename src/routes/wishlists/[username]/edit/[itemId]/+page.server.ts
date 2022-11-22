import { error, invalid, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals, params }) => {
	const { session, user } = await locals.getSessionUser();
	if (!session) throw redirect(302, "/login");

	if (isNaN(parseInt(params.itemId))) {
		throw error(400, "item id must be a number");
	}

	try {
		const item = await client.item.findUniqueOrThrow({
			where: {
				id: parseInt(params.itemId)
			},
			include: {
				addedBy: {
					select: {
						username: true
					}
				}
			}
		});

		if (user.username !== item?.addedBy?.username) {
			throw error(401, "cannot edit item that you did not create");
		}

		return {
			item
		};
	} catch {
		throw error(404, "item not found");
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await request.formData();
		const url = form.get("url") as string;
		const name = form.get("name") as string;
		let price = form.get("price") as string;
		const note = form.get("note") as string;

		// check for empty values
		if (!name) {
			return invalid(400);
		}

		if (price.indexOf("$") !== -1) {
			price = price.slice(price.indexOf("$") + 1);
		}

		await client.item.update({
			where: {
				id: parseInt(params.itemId)
			},
			data: {
				name,
				price,
				url,
				note
			}
		});

		throw redirect(302, `/wishlists/${params.username}`);
	}
};
