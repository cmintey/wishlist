import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    return { user: locals.user, isProxyUser: locals.isProxyUser, locale: locals.locale };
}) satisfies LayoutServerLoad;
