import { Role } from "$lib/schema";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        redirect(302, `/login?ref=/admin`);
    }
    if (locals.user.roleId !== Role.ADMIN) {
        error(401, "Not authorized to view admin panel");
    }

    redirect(302, "/admin/users");
};
