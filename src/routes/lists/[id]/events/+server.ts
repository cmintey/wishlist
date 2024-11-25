import { SSEvent } from "$lib/schema";
import { itemEmitter } from "$lib/server/events/emitters";
import { subscribe } from "$lib/server/events/sse";
import type { Item } from "@prisma/client";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { client } from "$lib/server/prisma";
import { getConfig } from "$lib/server/config";
import { produce } from "sveltekit-sse";

export const POST = (async ({ params }) => {
    const list = await client.publicList.findUnique({
        select: {
            userId: true,
            groupId: true
        },
        where: {
            id: params.id
        }
    });
    if (!list) {
        error(404, "Public list not found");
    }

    const config = await getConfig(list.groupId);
    if (config.listMode !== "registry") {
        return new Response();
    }

    const predicate = (item: Item | undefined) => {
        if (item) {
            return list.groupId === item.groupId && list.userId === item.userId;
        }
        return true;
    };

    return produce(({ emit }) => {
        return subscribe(emit, itemEmitter, predicate, SSEvent.ItemCreate, SSEvent.ItemUpdate, SSEvent.ItemDelete);
    });
}) satisfies RequestHandler;
