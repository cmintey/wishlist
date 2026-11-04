import { Role } from "#lib/schema.js";
import { requireRole } from "#lib/server/auth.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    await requireRole(Role.ADMIN);
};
