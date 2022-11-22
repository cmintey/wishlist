import { invalid, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (!session) throw redirect(302, "/login");
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const { user: me } = await locals.getSessionUser();
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

		await client.user.update({
			where: {
				username: params.username
			},
			data: {
				myItems: {
					create: {
						name,
						price,
						url,
						note,
						addedById: me?.userId
					}
				}
			}
		});

		throw redirect(302, `/wishlists/${params.username}`);
	}
};
