import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { client } from "$lib/server/prisma";
import { requireLoginOrError } from "$lib/server/auth";
import { itemEmitter } from "$lib/server/events/emitters";
import { ItemEvent } from "$lib/events";

export const PATCH: RequestHandler = async ({ params, request }) => {
    const user = await requireLoginOrError();
    if (!/^[1-9]\d*$/.test(params.itemId) || !Number.isSafeInteger(Number(params.itemId))) {
        error(400, "Invalid request");
    }
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        error(400, "Invalid request");
    }
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        Object.keys(body).length !== 1 ||
        typeof (body as { archived?: unknown }).archived !== "boolean"
    ) {
        error(400, "Invalid request");
    }
    const archived = (body as { archived: boolean }).archived;
    const id = Number(params.itemId);

    // The conditional write is atomic with concurrent claim mutations.
    const updated = await client.item.updateMany({
        where: {
            id,
            createdById: user.id,
            archived: !archived,
            ...(archived ? { lists: { some: { approved: true } } } : {})
        },
        data: { archived }
    });
    if (!updated.count) {
        const item = await client.item.findFirst({
            where: { id, createdById: user.id },
            select: { archived: true }
        });
        if (!item) error(404, "Not found");
        if (item.archived !== archived) error(409, "Wish cannot be archived");
        return new Response(null, { status: 200 });
    }

    const lists = await client.listItem.findMany({
        where: { itemId: id },
        select: {
            listId: true,
            addedById: true
        }
    });
    itemEmitter.emit(ItemEvent.ITEMS_UPDATE, { lists });
    return new Response(null, { status: 200 });
};
