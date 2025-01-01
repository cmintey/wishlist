import { SSEvents } from "$lib/schema";
import { itemEmitter } from "$lib/server/events/emitters";
import { createSSE } from "$lib/server/events/sse";
import type { Item as DbItem, List } from "@prisma/client";
import type { RequestHandler } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { getConfig } from "$lib/server/config";
import { getFormatter } from "$lib/i18n";
import { getById } from "$lib/server/list";
import { getActiveMembership } from "$lib/server/group-membership";

interface Item extends DbItem {
    lists: List[];
}

export const GET = (async ({ locals, params }) => {
    const $t = await getFormatter();

    const list = await getById(params.id);
    const config = await getConfig(list?.groupId);
    if (!locals.user) {
        // Unauthenticated users can only view public lists on groups in "registry" mode
        if (list && list.public) {
            if (config.listMode !== "registry") {
                error(404, $t("errors.public-list-not-found"));
            }
        } else {
            // List either doesn't exist or isn't public. Redirect to login so we don't expose details
            redirect(302, `/login?ref=/lists/${params.id}`);
        }
    } else {
        // Logged in users must be in the correct group, or viewing a public list
        const activeMembership = await getActiveMembership(locals.user);
        if (!list || (!list.public && list.groupId !== activeMembership.groupId)) {
            error(404, $t("errors.list-not-found"));
        }
    }

    // don't do updates on the list owners page for surprise mode since an item could be added that the owner shouldn't see
    if (
        config.suggestions.enable &&
        config.suggestions.method === "surprise" &&
        locals.user &&
        list.owner.id === locals.user.id
    ) {
        return new Response();
    }

    const predicate = (item: Item) => {
        return item.lists.map((l) => l.id).includes(params.id);
    };

    const { readable, subscribeToEvent } = createSSE<Item>();

    subscribeToEvent(itemEmitter, SSEvents.item.update, predicate);
    subscribeToEvent(itemEmitter, SSEvents.item.create, predicate);
    subscribeToEvent(itemEmitter, SSEvents.item.delete, predicate);
    subscribeToEvent(itemEmitter, SSEvents.items.update);

    return new Response(readable, {
        headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no"
        }
    });
}) satisfies RequestHandler;
