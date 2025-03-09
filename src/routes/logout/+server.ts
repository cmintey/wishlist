import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/auth";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, cookies }) => {
    if (!locals.session) return new Response(null, { status: 401 });
    await invalidateSession(locals.session?.id);
    deleteSessionTokenCookie(cookies);
    return new Response(null, { status: 201 });
};
