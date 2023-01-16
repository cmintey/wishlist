import { env } from "$env/dynamic/private";
import { client } from "$lib/server/prisma";
import { error, type RequestHandler } from "@sveltejs/kit";
import type { Session } from "lucia-auth";

const validateItem = async (itemId: string | undefined, session: Session | null) => {
	if (!session) throw error(401, "user is not authenticated");

	if (!itemId) {
		throw error(400, "must specify an item to delete");
	} else if (isNaN(parseInt(itemId))) {
		throw error(400, "item id must be a number");
	}

	const item = await client.item.findUnique({
		where: {
			id: parseInt(itemId)
		},
		select: {
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

	if (!item) {
		throw error(404, "item id not found");
	}
	return item;
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { session, user } = await locals.validateUser();

	const foundItem = await validateItem(params?.itemId, session);

	let suggestionDenied = false;
	const suggestionMethod = env.SUGGESTION_METHOD as SuggestionMethod;
	if (foundItem.user.username === user?.username && suggestionMethod === "approval") {
		suggestionDenied = true;
	}

	if (!suggestionDenied && foundItem.addedBy.username !== user?.username) {
		throw error(401, "user cannot delete an item they did not create");
	}

	try {
		const item = await client.item.delete({
			where: {
				// @ts-expect-error params.itemId is checked in a previous function
				id: parseInt(params.itemId)
			},
			select: {
				addedBy: {
					select: {
						username: true
					}
				}
			}
		});

		return new Response(JSON.stringify(item), { status: 200 });
	} catch (e) {
		throw error(404, "item id not found");
	}
};

export const PATCH: RequestHandler = async ({ params, locals, request }) => {
	const { session } = await locals.validateUser();

	await validateItem(params?.itemId, session);

	const body = await request.json();
	const data: {
		name?: string;
		price?: string;
		url?: string;
		note?: string;
		image_url?: string;
		pledgedById?: string;
		approved?: boolean;
	} = {};

	if (body.name) data.name = body.name;
	if (body.price) data.price = body.price;
	if (body.url) data.url = body.url;
	if (body.note) data.note = body.note;
	if (body.image_url) data.image_url = body.image_url;
	if (body.pledgedById) data.pledgedById = body.pledgedById === "0" ? null : body.pledgedById;
	if (body.approved) data.approved = body.approved;

	try {
		const item = await client.item.update({
			where: {
				// @ts-expect-error params.itemId is checked in a previous function
				id: parseInt(params.itemId)
			},
			data
		});

		return new Response(JSON.stringify(item), { status: 200 });
	} catch (e) {
		throw error(404, "item id not found");
	}
};
