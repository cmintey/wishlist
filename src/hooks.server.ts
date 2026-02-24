import type { RouteId } from "$app/types";
import { env } from "$env/dynamic/private";
import { getClosestAvailableLocaleFromHeader, getClosestAvailablePreferredLanguage, type Lang } from "$lib/i18n";
import {
    deleteSessionTokenCookie,
    getAllowedOrigins,
    isAllowedOrigin,
    sessionCookieName,
    setSessionTokenCookie,
    validateSessionToken
} from "$lib/server/auth";
import { logger } from "$lib/server/logger";
import { loadLocale } from "$lib/server/validations";
import { error, type Handle, type HandleServerError } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

/**
 * Custom CSRF protection hook to support multiple origins
 * Replaces SvelteKit's default CSRF verification
 * API routes (/api/v1/*) are excluded as they use API key authentication
 */
const csrfProtection: Handle = async ({ event, resolve }) => {
    const request = event.request;
    const method = request.method;
    const pathname = event.url.pathname;
    
    // Skip CSRF for API routes - they use API key authentication
    if (pathname.startsWith("/api/v1/")) {
        return resolve(event);
    }
    
    // CSRF verification only for methods that modify data
    if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
        const origin = request.headers.get("origin");
        
        // If no Origin header, check Referer as fallback
        if (origin) {
            if (!isAllowedOrigin(origin)) {
                logger.warn(
                    `CSRF check failed: origin '${origin}' not in allowed origins: [${getAllowedOrigins().join(", ")}]`
                );
                error(403, "Cross-site request forbidden");
            }
        }
    }
    
    return resolve(event);
};

const mainHandle: Handle = async ({ event, resolve }) => {
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

    const isProxyUser =
        (env.HEADER_AUTH_ENABLED ?? "false") == "true" &&
        !!env.HEADER_USERNAME &&
        !!event.request.headers.get(env.HEADER_USERNAME);

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

// Combine hooks: CSRF first, then main handler
export const handle = sequence(csrfProtection, mainHandle);

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

const nonPrivateRoutes: RouteId[] = [
    "/login",
    "/signup",
    "/setup-wizard",
    "/setup-wizard/step",
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
