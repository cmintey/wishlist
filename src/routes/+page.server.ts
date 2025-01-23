import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    const user = locals.user;
    if (!user) {
        redirect(302, `/login`);
    }

    redirect(302, "/lists");
}) satisfies PageServerLoad;
