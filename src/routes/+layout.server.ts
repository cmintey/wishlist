import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    const session = await locals.validate();
    return { user: session?.user };
}) satisfies LayoutServerLoad;
