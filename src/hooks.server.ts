import { env } from "$env/dynamic/private";
import { getClosestAvailableLocaleFromHeader, getClosestAvailablePreferredLanguage, type Lang } from "$lib/i18n";
import {
    deleteSessionTokenCookie,
    sessionCookieName,
    setSessionTokenCookie,
    validateSessionToken
} from "$lib/server/auth";
import { logger } from "$lib/server/logger";
import { loadLocale } from "$lib/server/validations";
import type { Handle, HandleServerError } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    let lang = getClosestAvailableLocaleFromHeader(event.request.headers.get("accept-language"));

    const sessionToken = event.cookies.get(sessionCookieName);
    if (!sessionToken) {
        event.locals.user = null;
        event.locals.session = null;
        event.locals.isProxyUser = false;
        event.locals.locale = lang.code;
        return resolve(event, {
            transformPageChunk({ html }) {
                return transformForLang(html, lang);
            }
        });
    }

    const { session, user } = await validateSessionToken(sessionToken);
    if (user?.preferredLanguage) {
        lang = getClosestAvailablePreferredLanguage(user.preferredLanguage) ?? lang;
    }

    await loadLocale(lang.code);
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
    event.locals.locale = lang.code;

    return resolve(event, {
        transformPageChunk({ html }) {
            return transformForLang(html, lang);
        }
    });
};

function transformForLang(html: string, lang: Lang) {
    return html.replace("%lang%", lang.code).replace("%dir%", lang.rtl ? "rtl" : "ltr");
}

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
