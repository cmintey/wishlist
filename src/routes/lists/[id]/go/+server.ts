import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getById } from "$lib/server/list";
import { setActiveMembership, getActiveMembership } from "$lib/server/group-membership";
import { requireLogin } from "$lib/server/auth";

/**
 * GET /lists/[id]/go
 * Redirects to the list, switching the active group if necessary.
 * This is useful for extensions that want to open a list directly
 * without knowing which group is currently active.
 */
export const GET: RequestHandler = async ({ params, url }) => {
    const user = requireLogin();

    const list = await getById(params.id);
    
    if (!list) {
        redirect(302, "/lists");
    }

    // Check if user needs to switch groups
    const activeMembership = await getActiveMembership(user);
    
    if (list.groupId !== activeMembership.groupId) {
        // Switch to the list's group
        await setActiveMembership(user.id, list.groupId);
    }

    // Redirect to the actual list page
    redirect(302, `/lists/${params.id}`);
};
