import { fail, redirect } from "@sveltejs/kit";
import { writeFileSync } from "fs";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals, params }) => {
	const session = await locals.getSession();
	if (!session) {
		throw redirect(302, `/login?ref=/wishlists/${params.username}/new`);
	}
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const { user: me } = await locals.getSessionUser();
		const form = await request.formData();
		const url = form.get("url") as string;
		const image_url = form.get("image_url") as string;
		const image = form.get("image") as File;
		const name = form.get("name") as string;
		let price = form.get("price") as string;
		const note = form.get("note") as string;

		// check for empty values
		if (!name) {
			return fail(400, { name, missing: true });
		}

		let filename = "";

		let create_image = image.size > 0 && image.size <= 5000000;

		if (create_image) {
			const ext = image.name.split(".").pop();
			filename = me!.username + "-" + Date.now().toString() + "." + ext;

			let ab = await image.arrayBuffer();

			writeFileSync(`uploads/${filename}`, Buffer.from(ab));
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
						image_url: create_image ? filename : image_url,
						addedById: me?.userId
					}
				}
			}
		});

		throw redirect(302, `/wishlists/${params.username}`);
	}
};
