import { error, invalid, redirect } from "@sveltejs/kit";
import { writeFileSync } from "fs";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals, params, request }) => {
	const { session, user } = await locals.getSessionUser();
	if (!session) {
		const path = new URL(request.url).pathname;
		throw redirect(302, `/login?ref=${path}`);
	}

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
	default: async ({ locals, request, params }) => {
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
			return invalid(400, { name, missing: true });
		}

		let filename = "";

		let create_image = image.size > 0 && image.size <= 5000000;

		if (create_image) {
			const ext = image.name.split(".").pop();
			filename = me!.username + "-" + Date.now().toString() + "." + ext;

			let ab = await image.arrayBuffer();

			writeFileSync(`static/img/uploads/${filename}`, Buffer.from(ab));
		}

		await client.item.update({
			where: {
				id: parseInt(params.itemId)
			},
			data: {
				name,
				price,
				url,
				image_url: create_image ? `/img/uploads/${filename}` : image_url,
				note
			}
		});

		throw redirect(302, `/wishlists/${params.username}`);
	}
};
