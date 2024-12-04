import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    return { user: locals.user, isProxyUser: locals.isProxyUser };
}) satisfies LayoutServerLoad;
