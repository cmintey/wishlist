import { auth } from "$lib/server/auth";
import { handleHooks } from "@lucia-auth/sveltekit";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = handleHooks(auth);
