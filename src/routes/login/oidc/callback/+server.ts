import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { handleCallback, REDIRECT_TO_COOKIE } from "$lib/server/openid";
import { client } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import type { RequestEvent, RequestHandler } from "./$types";
import { createUser } from "$lib/server/user";
import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { getFormatter } from "$lib/server/i18n";
import { logger } from "$lib/server/logger";

export const POST: RequestHandler = async (event) => {
    const $t = await getFormatter();
    const userinfo = await handleCallback(event);

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
        await authenticate(event, user.id);
    }

    if (!userinfo.email) {
        error(400, $t("auth.email-was-not-provided-by-the-identity-provider"));
    }
    if (userinfo.email_verified === false) {
        error(400, $t("auth.email-is-not-verified-with-the-identity-provider"));
    }

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
        await client.user.update({
            data: {
                oauthId: userinfo.sub
            },
            where: {
                id: user.id
            }
        });
        await authenticate(event, user.id);
    }

    // No existing user was found
    const config = await getConfig();
    if (!config.oidc.autoRegister) {
        logger.warn(
            `Could not register ${userinfo.sub}/${userinfo.email || "(no email)"}. Auto registration is disabled.`
        );
        error(400, $t("errors.registration-is-disabled"));
    }

    // create user
    user = await createUser(
        {
            name: userinfo.name ?? userinfo.email,
            username: userinfo.preferred_username ?? userinfo.email,
            email: userinfo.email
        },
        Role.USER,
        ""
    );

    if (config.defaultGroup) {
        await client.userGroupMembership.create({
            data: {
                groupId: config.defaultGroup,
                userId: user.id,
                active: true
            }
        });
    }

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

    const redirectTo = event.cookies.get(REDIRECT_TO_COOKIE) ?? "/";
    redirect(302, redirectTo);
}
