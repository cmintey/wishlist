import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/auth";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, cookies }) => {
    if (!locals.session) return new Response(null, { status: 401 });
    await invalidateSession(locals.session?.id);
    deleteSessionTokenCookie(cookies);

    cookies.set("direct", "1", {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax"
    });

    return new Response(null, { status: 201 });
};
