import { getConfig } from "$lib/server/config";
import { getActiveMembership } from "$lib/server/group-membership";
import { client } from "$lib/server/prisma";
import { error, type RequestHandler } from "@sveltejs/kit";
import assert from "assert";
import type { Session } from "lucia";

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
    const session = await locals.validate();

    const foundItem = await validateItem(params?.itemId, session);
    assert(session);
    assert(params.itemId);

    const activeMembership = await getActiveMembership(session.user);
    const config = await getConfig(activeMembership.groupId);

    let suggestionDenied = false;
    const suggestionMethod = config.suggestions.method;
    if (foundItem.user.username === session.user.username && suggestionMethod !== "surprise") {
        suggestionDenied = true;
    }

    if (!suggestionDenied && foundItem.addedBy.username !== session.user.username) {
        throw error(401, "user cannot delete an item they did not create");
    }

    try {
        const item = await client.item.delete({
            where: {
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
    const session = await locals.validate();

    await validateItem(params?.itemId, session);

    const body = (await request.json()) as Record<string, unknown>;
    const data: {
        name?: string;
        price?: string;
        url?: string;
        note?: string;
        image_url?: string;
        pledgedBy?: {
            connect?: { id: string };
            disconnect?: boolean;
        };
        approved?: boolean;
        purchased?: boolean;
    } = {};

    if (body.name && typeof body.name === "string") data.name = body.name;
    if (body.price && typeof body.price === "string") data.price = body.price;
    if (body.url && typeof body.url === "string") data.url = body.url;
    if (body.note && typeof body.note === "string") data.note = body.note;
    if (body.image_url && typeof body.image_url === "string") data.image_url = body.image_url;
    if (body.pledgedById && typeof body.pledgedById === "string") {
        if (body.pledgedById === "0") {
            data.pledgedBy = {
                disconnect: true
            };
        } else {
            data.pledgedBy = {
                connect: {
                    id: body.pledgedById
                }
            };
        }
    }
    if (Object.keys(body).includes("approved") && typeof body.approved === "boolean") data.approved = body.approved;
    if (Object.keys(body).includes("purchased") && typeof body.purchased === "boolean") data.purchased = body.purchased;

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
