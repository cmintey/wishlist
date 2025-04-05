import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { requireLogin } from "$lib/server/auth";

export const load = (async () => {
    requireLogin();

    redirect(302, "/lists");
}) satisfies PageServerLoad;
