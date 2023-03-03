import { error, fail, redirect } from "@sveltejs/kit";
import { writeFileSync } from "fs";
import type { Actions, PageServerLoad } from "./$types";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";

export const load: PageServerLoad = async ({ locals, params }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/wishlists/${params.username}/new`);
	}
	const config = await getConfig();

	if (!config.suggestions.enable && user.username !== params.username) {
		throw error(401, "Suggestions are disabled");
	}

	const listOwner = await client.user.findUniqueOrThrow({
		where: {
			username: params.username
		},
		select: {
			username: true,
			name: true
		}
	});

	return {
		owner: {
			name: listOwner.name,
			isMe: params.username === listOwner.username
		},
		suggestion: user.username !== params.username,
		suggestionMethod: config.suggestions.method
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const { user: me, session } = await locals.validateUser();
		if (!session) throw error(401);
		const config = await getConfig();

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

		const create_image = image.size > 0 && image.size <= 5000000;

		if (create_image) {
			const ext = image.name.split(".").pop();
			filename = me?.username + "-" + Date.now().toString() + "." + ext;

			const ab = await image.arrayBuffer();

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
				items: {
					create: {
						name,
						price,
						url,
						note,
						image_url: create_image ? filename : image_url,
						addedById: me.userId,
						approved: config.suggestions.method !== "approval"
					}
				}
			}
		});

		throw redirect(302, `/wishlists/${params.username}`);
	}
};
