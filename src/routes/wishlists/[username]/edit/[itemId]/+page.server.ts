import { error, fail, redirect } from "@sveltejs/kit";
import { writeFileSync } from "fs";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import config from "$lib/server/config";

export const load: PageServerLoad = async ({ locals, params }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/wishlists/${params.username}/edit/${params.itemId}`);
	}

	if (isNaN(parseInt(params.itemId))) {
		throw error(400, "item id must be a number");
	}

	let item;
	try {
		item = await client.item.findUniqueOrThrow({
			where: {
				id: parseInt(params.itemId)
			},
			include: {
				addedBy: {
					select: {
						username: true
					}
				},
				user: {
					select: {
						username: true
					}
				}
			}
		});
	} catch {
		throw error(404, "item not found");
	}

	if (config.suggestions.method === "surprise" && user.username !== item.addedBy?.username) {
		throw error(401, "cannot edit item that you did not create");
	}

	if (params.username !== item.user.username) {
		throw error(400, `Item does not belong to ${params.username}`);
	}

	return {
		item
	};
};

export const actions: Actions = {
	default: async ({ locals, request, params }) => {
		const { user: me } = await locals.validateUser();
		const form = await request.formData();
		const url = form.get("url") as string;
		const image_url = form.get("image_url") as string;
		const image = form.get("image") as File;
		const name = form.get("name") as string;
		const price = form.get("price") as string;
		const note = form.get("note") as string;

		// check for empty values
		if (!name) {
			return fail(400, { name, missing: true });
		}

		let filename = "";

		const create_image = image.size > 0 && image.size <= 5000000;

		if (create_image) {
			const ext = image.name.split(".").pop();
			filename = me?.username + "-" + Date.now().toString() + "." + ext;

			const ab = await image.arrayBuffer();

			writeFileSync(`uploads/${filename}`, Buffer.from(ab));
		}

		await client.item.update({
			where: {
				id: parseInt(params.itemId)
			},
			data: {
				name,
				price,
				url,
				image_url: create_image ? filename : image_url,
				note
			}
		});

		throw redirect(302, `/wishlists/${params.username}`);
	}
};
