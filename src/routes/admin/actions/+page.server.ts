import { Role } from "$lib/schema";
import { requireRole } from "$lib/server/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    await requireRole(Role.ADMIN);
};
