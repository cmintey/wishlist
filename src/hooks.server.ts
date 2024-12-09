import { env } from "$env/dynamic/private";
import { auth } from "$lib/server/auth";
import { logger } from "$lib/server/logger";
import type { Handle, HandleServerError } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(auth.sessionCookieName);
    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;

        const response = await resolve(event);
        logger.info({
            status: response.status,
            method: event.request.method,
            uri: event.url.pathname + event.url.search + event.url.hash,
            hasSession: false
        });
        return response;
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
    const isProxyUser =
        (env.HEADER_AUTH_ENABLED ?? "false") == "true" &&
        !!env.HEADER_USERNAME &&
        !!event.request.headers.get(env.HEADER_USERNAME);

    event.locals.isProxyUser = isProxyUser;
    event.locals.user = user;
    event.locals.session = session;

    const response = await resolve(event);

    logger.info({
        status: response.status,
        method: event.request.method,
        uri: event.url.pathname + event.url.search + event.url.hash,
        hasSession: true,
        isProxyUser
    });
    return response;
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
    logger.error(
        {
            status,
            method: event.request.method,
            uri: event.url.pathname + event.url.search + event.url.hash,
            err: error
        },
        message
    );
};
