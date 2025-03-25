import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { handleCallback, REF_COOKIE } from "$lib/server/openid";
import { client } from "$lib/server/prisma";
import { redirect, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createUser } from "$lib/server/user";
import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";
import { getFormatter } from "$lib/i18n";

export const POST: RequestHandler = async (event) => {
    const $t = await getFormatter();
    const userinfo = await handleCallback(event);

    if (!userinfo.email) {
        error(400, $t("auth.email-was-not-provided-by-the-identity-provider"));
    }
    if (userinfo.email_verified === false) {
        error(400, $t("auth.email-is-not-verified-with-the-identity-provider"));
    }

    // Look for existing User
    let user = await client.user.findUnique({
        select: {
            id: true
        },
        where: {
            email: userinfo.email
        }
    });

    if (!user) {
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

        const config = await getConfig();
        if (config.defaultGroup) {
            await client.userGroupMembership.create({
                data: {
                    groupId: config.defaultGroup,
                    userId: user.id,
                    active: true
                }
            });
        }
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);

    const redirectTo = event.cookies.get(REF_COOKIE) ?? "/";
    redirect(302, redirectTo);
};
