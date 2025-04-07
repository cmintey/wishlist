import { env } from "$env/dynamic/private";
import { defaultLocale, getClosestAvailableLocaleFromHeader } from "$lib/i18n";
import {
    deleteSessionTokenCookie,
    sessionCookieName,
    setSessionTokenCookie,
    validateSessionToken
} from "$lib/server/auth";
import { logger } from "$lib/server/logger";
import type { Handle, HandleServerError } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    const lang = getClosestAvailableLocaleFromHeader(event.request.headers.get("accept-language"));

    const sessionToken = event.cookies.get(sessionCookieName);
    if (!sessionToken) {
        event.locals.user = null;
        event.locals.session = null;
        return resolve(event);
    }

    const { session, user } = await validateSessionToken(sessionToken);
    if (session !== null) {
        setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);
    } else {
        deleteSessionTokenCookie(event.cookies);
    }

    const isProxyUser =
        (env.HEADER_AUTH_ENABLED ?? "false") == "true" &&
        !!env.HEADER_USERNAME &&
        !!event.request.headers.get(env.HEADER_USERNAME);

    event.locals.isProxyUser = isProxyUser;
    event.locals.user = user;
    event.locals.session = session;
    event.locals.locale = lang || defaultLocale;

    return resolve(event);
};

export const handleError: HandleServerError = async ({ error: err, event, status, message }) => {
    logger.error(
        {
            status,
            method: event.request.method,
            uri: event.url.pathname + event.url.search + event.url.hash,
            err
        },
        message
    );
};
