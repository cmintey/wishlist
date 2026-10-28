import type { PageServerLoad } from "../$types";
import { requireLogin } from "#lib/server/auth.js";

export const load: PageServerLoad = async () => {
    requireLogin();
};
