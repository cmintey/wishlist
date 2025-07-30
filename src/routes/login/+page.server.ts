import { error, fail, redirect, type Cookies } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { getLoginSchema } from "$lib/server/validations";
import { getConfig } from "$lib/server/config";
import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import type { PageServerLoad, Actions } from "./$types";
import { createUser } from "$lib/server/user";
import { verifyPasswordHash } from "$lib/server/password";
import { getOIDCConfig } from "$lib/server/openid";
import { logger } from "$lib/server/logger";
import z from "zod";

export const load: PageServerLoad = async ({ locals, request, cookies, url }) => {
    const config = await getConfig();
    const redirectTo = url.searchParams.get("redirectTo");
    if (locals.user) {
        redirect(302, redirectTo || "/");
    }

    const userCount = await client.user.count();
    if (userCount === 0) {
        redirect(302, "/setup-wizard");
    }

    const oidcConfig = await getOIDCConfig();
    if (oidcConfig.ready && oidcConfig.autoRedirect && canRedirect(url, cookies)) {
        redirect(302, "/login/oidc");
    }

    /* Header authentication */
    if ((env.HEADER_AUTH_ENABLED ?? "false") == "true" && !!env.HEADER_USERNAME) {
        const username = request.headers.get(env.HEADER_USERNAME);
        if (username) {
            let user = await client.user.findUnique({
                select: {
                    id: true
                },
                where: {
                    username: username
                }
            });

            if (!user) {
                if (!env.HEADER_EMAIL || !env.HEADER_NAME) {
                    logger.error("Missing required environment variables for header authentication");
                    return fail(400, { username: username, password: "", incorrect: true });
                }
                const name = request.headers.get(env.HEADER_NAME);
                const email = request.headers.get(env.HEADER_EMAIL);
                if (!name || !email) {
                    logger.error("Missing required headers for header authentication");
                    return fail(400, { username: username, password: "", incorrect: true });
                }
                const userCount = await client.user.count();
                user = await createUser(
                    {
                        username: username,
                        email: email,
                        name: name
                    },
                    userCount > 0 ? Role.USER : Role.ADMIN,
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
            }

            const sessionToken = generateSessionToken();
            const session = await createSession(sessionToken, user.id);
            setSessionTokenCookie(cookies, sessionToken, session.expiresAt);
            redirect(302, redirectTo || "/");
        }
    }
    /* End header authentication */

    return {
        enableLogin: !config.security.disablePasswordLogin,
        enableSignup: config.enableSignup,
        isCallback: url.searchParams.has("state"),
        error: url.searchParams.get("error"),
        oidcConfig
    };
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const config = await getConfig();
        if (config.security.disablePasswordLogin) {
            error(400, "Password login is disabled");
        }

        const formData = Object.fromEntries(await request.formData());
        const loginData = (await getLoginSchema()).safeParse(formData);
        // check for empty values
        if (!loginData.success) {
            return fail(400, { error: true, errors: z.flattenError(loginData.error).fieldErrors });
        }

        try {
            const maybeUser = await client.user.findUnique({
                select: {
                    id: true,
                    hashedPassword: true
                },
                where: {
                    username: loginData.data.username
                }
            });

            if (!maybeUser) {
                return fail(400, { username: loginData.data.username, password: "", incorrect: true });
            }

            const isValid = await verifyPasswordHash(maybeUser.hashedPassword, loginData.data.password);
            if (!isValid) {
                return fail(400, { username: loginData.data.username, password: "", incorrect: true });
            }

            const sessionToken = generateSessionToken();
            const session = await createSession(sessionToken, maybeUser.id);
            setSessionTokenCookie(cookies, sessionToken, session.expiresAt);
            cookies.delete("direct", { path: "/" });
        } catch {
            // invalid credentials
            return fail(400, { username: loginData.data.username, password: "", incorrect: true });
        }
    }
};

function canRedirect(url: URL, cookies: Cookies) {
    return (
        !url.searchParams.has("direct") &&
        !url.searchParams.has("state") &&
        !url.searchParams.has("error") &&
        !cookies.get("direct")
    );
}
