import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getConfig } from "$lib/server/config";
import { getFormatter } from "$lib/server/i18n";
import { getById, getItems, type GetItemsOptions } from "$lib/server/list";
import { getActiveMembership } from "$lib/server/group-membership";
import type { UserGroupMembership } from "@prisma/client";

export const load = (async ({ params, url, locals, depends }) => {
    const $t = await getFormatter();

    const list = await getById(params.id);

    let activeMembership: UserGroupMembership | undefined;
    if (!locals.user) {
        // Unauthenticated users can only view public lists
        if (!list || !list.public) {
            // Redirect to login so we don't expose details if the list does exist
            const redirectTo = url.pathname + url.search;
            const params = new URLSearchParams({ redirectTo });
            redirect(307, `/login?${params}`);
        }
    } else {
        // Logged in users must be in the correct group, or viewing a public list
        activeMembership = await getActiveMembership(locals.user);
        if (!list || (!list.public && list.groupId !== activeMembership.groupId)) {
            error(404, $t("errors.list-not-found"));
        }
        // Owners of the public list need to be in the correct group still
        if (list.owner.id === locals.user.id && list?.public && list.groupId !== activeMembership.groupId) {
            error(401, $t("errors.user-must-be-in-the-correct-group"));
        }
    }

    const config = await getConfig(list.groupId);

    const options: GetItemsOptions = {
        filter: url.searchParams.get("filter"),
        sort: url.searchParams.get("sort"),
        sortDir: url.searchParams.get("dir"),
        suggestionMethod: config.suggestions.method,
        listOwnerId: list.owner.id,
        loggedInUserId: locals.user?.id || null
    };

    const items = await getItems(list.id, options);

    depends("data:items");
    return {
        list: {
            ...list,
            owner: {
                ...list.owner,
                isMe: list.owner.id === locals.user?.id,
                activeGroupId: list.groupId
            },
            items
        },
        loggedInUser: locals.user
            ? {
                  id: locals.user.id,
                  username: locals.user.username,
                  name: locals.user.name,
                  activeGroupId: activeMembership!.groupId
              }
            : undefined,
        listMode: config.listMode,
        showClaimedName: config.claims.showName,
        requireClaimEmail: config.claims.requireEmail,
        suggestionsEnabled: config.suggestions.enable
    };
}) satisfies PageServerLoad;
