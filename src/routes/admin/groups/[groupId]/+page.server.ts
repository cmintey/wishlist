import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { requireAdminOrManager } from "$lib/server/auth";

export const load: PageServerLoad = async ({ url, params }) => {
    await requireAdminOrManager(params.groupId);

    redirect(302, `${url.pathname}/members`);
};
