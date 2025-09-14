import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { handleCallback, REDIRECT_TO_COOKIE } from "$lib/server/openid";
import { client } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import type { RequestEvent, RequestHandler } from "./$types";
import { createUser } from "$lib/server/user";
import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { getFormatter } from "$lib/server/i18n";
import { oidcLogger as logger } from "$lib/server/logger";

export const POST: RequestHandler = async (event) => {
    const $t = await getFormatter();
    const userinfo = await handleCallback(event);

    logger.debug("Searching for existing user via oauthId: %s", userinfo.sub);
    // Find by oAuthId
    let user = await client.user.findFirst({
        select: {
            id: true
        },
        where: {
            oauthId: userinfo.sub
        }
    });
    if (user) {
        logger.debug("Found existing user: %s", user.id);
        await authenticate(event, user.id);
    }
    logger.debug("No existing user found");

    if (!userinfo.email) {
        logger.error("No email found in userinfo");
        error(400, $t("auth.email-was-not-provided-by-the-identity-provider"));
    }
    if (userinfo.email_verified === false) {
        logger.error("Found email for user, but email is not verified with the IdP");
        error(400, $t("auth.email-is-not-verified-with-the-identity-provider"));
    }

    logger.debug("Looking for existing user via email: %s", userinfo.email);
    // Look for existing User by email
    user = await client.user.findUnique({
        select: {
            id: true
        },
        where: {
            email: userinfo.email
        }
    });

    // User found by email, update the oauthId and continue logging in
    if (user) {
        logger.debug("Found existing user: %s", user.id);
        await client.user.update({
            data: {
                oauthId: userinfo.sub
            },
            where: {
                id: user.id
            }
        });
        logger.debug("Linked user account to OAuth via oauthId: %s", userinfo.sub);
        await authenticate(event, user.id);
    }

    logger.debug("No existing user found");

    // No existing user was found
    const config = await getConfig();
    if (!config.oidc.autoRegister) {
        logger.warn(
            `Could not register ${userinfo.sub}/${userinfo.email || "(no email)"}. Auto registration is disabled.`
        );
        error(400, $t("errors.registration-is-disabled"));
    }

    const userData = {
        name: userinfo.name ?? userinfo.email,
        username: userinfo.preferred_username ?? userinfo.email,
        email: userinfo.email,
        oauthId: userinfo.sub
    };
    logger.debug(userData, "Registering a new user");
    user = await createUser(userData, Role.USER, "");

    await authenticate(event, user.id);

    // never
    return new Response(null, {
        status: 302,
        headers: {
            Location: "/"
        }
    });
};

async function authenticate(event: RequestEvent, userId: string): Promise<never> {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId);
    setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);

    logger.debug("Authenticated user successfully");
    const redirectTo = event.cookies.get(REDIRECT_TO_COOKIE) ?? "/";
    redirect(302, redirectTo);
}
