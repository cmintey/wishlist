import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { handleCallback } from "$lib/server/openid";
import { client } from "$lib/server/prisma";
import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createUser } from "$lib/server/user";
import { Role } from "$lib/schema";
import { getConfig } from "$lib/server/config";

// TODO: Change this to a load function so we can handle errors and show a loading screen
export const GET: RequestHandler = async (event) => {
    const userinfo = await handleCallback(event);

    if (!userinfo.email) {
        error(400, "Missing email");
    }
    if (userinfo.email_verified === false) {
        error(400, "Email is not verified with the Identity Provider");
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

    const redirectTo = event.url.searchParams.get("ref") || "/";
    redirect(302, redirectTo);
};
