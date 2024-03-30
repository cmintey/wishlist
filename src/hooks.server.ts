import { auth } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(auth.sessionCookieName);
    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;
        return resolve(event);
    }

    const { session, user } = await auth.validateSession(sessionId);
    if (session && session.fresh) {
        const sessionCookie = auth.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });
    }
    if (!session) {
        const sessionCookie = auth.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });
    }
    event.locals.user = user;
    event.locals.session = session;
    return resolve(event);
};
