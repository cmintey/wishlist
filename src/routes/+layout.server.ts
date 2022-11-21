import { handleServerSession } from "@lucia-auth/sveltekit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = handleServerSession();
