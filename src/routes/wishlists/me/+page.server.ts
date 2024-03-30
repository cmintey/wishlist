import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, "/login?ref=/wishlists/me");
    }

    redirect(302, `/wishlists/${locals.user.username}`);
};
