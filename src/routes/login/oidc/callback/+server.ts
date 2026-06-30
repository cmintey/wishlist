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
import { Prisma, type User } from "$lib/generated/prisma/client";
import type { UserInfoResponse } from "openid-client";

export const POST: RequestHandler = async (event) => {
    const $t = await getFormatter();
    const userinfo = await handleCallback(event);
    const config = await getConfig();

    logger.debug("Searching for existing user via oauthId: %s", userinfo.sub);
    // Find by oAuthId
    let user = await client.user.findFirst({
        select: {
            id: true,
            name: true,
            email: true,
            username: true
        },
        where: {
            oauthId: userinfo.sub
        }
    });
    if (user) {
        logger.debug("Found existing user: %s", user.id);
        await syncUserDetails(user, userinfo, config);
        await authenticate(event, user.id);
    }
    logger.debug("No existing user found");

    if (!userinfo.email) {
        logger.error("No email found in userinfo");
        error(400, $t("auth.email-was-not-provided-by-the-identity-provider"));
    }
    if (userinfo.email_verified === false && !config.oidc.disableEmailVerification) {
        logger.error("Found email for user, but email is not verified with the IdP");
        error(400, $t("auth.email-is-not-verified-with-the-identity-provider"));
    }

    logger.debug("Looking for existing user via email: %s", userinfo.email);
    // Look for existing User by email
    user = await client.user.findUnique({
        select: {
            id: true,
            name: true,
            email: true,
            username: true
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
        await syncUserDetails(user, userinfo, config);
        await authenticate(event, user.id);
    }

    logger.debug("No existing user found");

    // No existing user was found
    if (!config.oidc.autoRegister) {
        logger.warn(
            `Could not register ${userinfo.sub}/${userinfo.email || "(no email)"}. Auto registration is disabled.`
        );
        error(400, $t("errors.registration-is-disabled"));
    }

    const userData = {
        name: extractClaim(config.oidc.nameClaim || "name", userinfo, userinfo.email)!,
        username: extractClaim(config.oidc.usernameClaim || "preferred_username", userinfo, userinfo.email)!,
        email: userinfo.email,
        oauthId: userinfo.sub
    };
    logger.debug(userData, "Registering a new user");
    const newUser = await createUser(userData, Role.USER, "");

    await authenticate(event, newUser.id);

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

function extractClaim(claim: string | null | undefined, userinfo: UserInfoResponse, fallback?: string) {
    if (claim) {
        const value = userinfo[claim];
        if (value && typeof value === "string") {
            return value;
        }
    }

    logger.warn(`'${claim}' claim was not found in user's claims. Available claims: ${Object.keys(userinfo)}`);
    return fallback;
}

async function syncUserDetails(
    user: Pick<User, "id" | "name" | "email" | "username">,
    userinfo: UserInfoResponse,
    config: Config
) {
    const updateData: Prisma.UserUpdateInput = {};

    if (userinfo.email && user.email !== userinfo.email) {
        updateData["email"] = userinfo.email;
    }
    const name = extractClaim(config.oidc.nameClaim || "name", userinfo);
    if (name && user.name !== name) {
        updateData["name"] = name;
    }
    const username = extractClaim(config.oidc.usernameClaim || "preferred_username", userinfo);
    if (username && user.username !== username) {
        updateData["username"] = username;
    }

    if (Object.keys(updateData).length === 0) {
        return;
    }
    logger.debug("Syncing user attributes from IdP");

    if ("email" in updateData || "username" in updateData) {
        const users = await client.user.findMany({
            select: {
                email: true,
                username: true
            },
            where: {
                id: {
                    not: user.id
                },
                OR: [userinfo.email ? { email: userinfo.email } : {}, username ? { username } : {}]
            }
        });

        if (users.length > 0) {
            const conflictingEmail = users.find(({ email }) => email === userinfo.email) !== undefined;
            const conflictingUsername = users.find(({ email }) => email === username) !== undefined;

            const conflicts: Record<string, unknown> = {};
            if (conflictingEmail) {
                conflicts["email"] = userinfo.email;
                updateData["email"] = undefined;
            }
            if (conflictingUsername) {
                conflicts["username"] = username;
                updateData["username"] = undefined;
            }
            logger.warn("Unable to sync the following attributes due to conflicts: %s", conflicts);
        }
    }

    await client.user.update({
        where: {
            id: user.id
        },
        data: updateData
    });

    logger.debug("User attributes synced from IdP");
}
