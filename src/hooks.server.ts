import type { Handle, HandleServerError } from "@sveltejs/kit/hooks";
import type { RouteId } from "$app/types";
import { HEADER_AUTH_ENABLED, HEADER_USERNAME } from "$app/env/private";

import { getClosestAvailableLocaleFromHeader, getClosestAvailablePreferredLanguage, type Lang } from "#lib/i18n.js";

import {
    deleteSessionTokenCookie,
    sessionCookieName,
    setSessionTokenCookie,
    validateSessionToken
} from "#lib/server/auth.js";
import { logger } from "#lib/server/logger.js";
import { loadLocale } from "#lib/server/validations.js";

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

    const { session, user, fresh } = await validateSessionToken(sessionToken);
    if (user?.preferredLanguage) {
        lang = getClosestAvailablePreferredLanguage(user.preferredLanguage) ?? lang;
    }

    await loadLocale(lang.code);
    if (session === null) {
        deleteSessionTokenCookie(event.cookies);
    } else if (fresh) {
        setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);
    }

    const isProxyUser = HEADER_AUTH_ENABLED && !!HEADER_USERNAME && !!event.request.headers.get(HEADER_USERNAME);

    event.locals.isProxyUser = isProxyUser;
    event.locals.user = user;
    event.locals.session = session;
    event.locals.locale = lang.code;

    if (isPrivateRoute(event.route.id)) {
        event.setHeaders({
            "Cache-Control": "private"
        });
    }

    return resolve(event, {
        transformPageChunk({ html }) {
            return transformForLang(html, lang);
        }
    });
};

export const handleError: HandleServerError = ({ kind, error, event }) => {
    const shouldLog = kind === "framework" || kind === "unknown";
    if (shouldLog) {
        const status = kind === "framework" ? error.status : 500;
        const message = kind === "framework" ? error.message : "Unknown error ocurred.";

        logger.error(
            {
                status,
                method: event.request.method,
                uri: event.url.pathname + event.url.search + event.url.hash,
                err: error
            },
            message
        );
    }
};

const nonPrivateRoutes: RouteId[] = [
    "/login",
    "/signup",
    "/setup-wizard",
    "/setup-wizard/step/[step]",
    "/reset-password",
    "/group-error",
    "/api/assets/[id]"
];

function transformForLang(html: string, lang: Lang) {
    return html.replace("%lang%", lang.code).replace("%dir%", lang.rtl ? "rtl" : "ltr");
}

function isPrivateRoute(routeId: RouteId | null) {
    return routeId && !nonPrivateRoutes.includes(routeId);
}
