import { auth } from "$lib/server/auth";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, cookies }) => {
    if (!locals.session) return new Response(null, { status: 401 });
    await auth.invalidateSession(locals.session?.id); // invalidate session
    const sessionCookie = auth.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
        path: "/",
        ...sessionCookie.attributes
    });
    return new Response(null, { status: 201 });
};
