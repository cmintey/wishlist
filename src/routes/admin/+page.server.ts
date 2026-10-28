import { Role } from "#lib/schema.js";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { requireRole } from "#lib/server/auth.js";

export const load: PageServerLoad = async () => {
    await requireRole(Role.ADMIN);

    redirect(302, "/admin/users");
};
