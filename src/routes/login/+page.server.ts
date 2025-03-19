import { fail, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { getLoginSchema } from "$lib/validations";
import { getConfig } from "$lib/server/config";
import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import type { PageServerLoad, Actions } from "./$types";
import { createUser } from "$lib/server/user";
import { verifyPasswordHash } from "$lib/server/password";
import { isOIDCConfigured } from "$lib/server/openid";

export const load: PageServerLoad = async ({ locals, request, cookies, url }) => {
    const config = await getConfig();
    const ref = url.searchParams.get("ref");
    if (locals.user) {
        redirect(302, ref || "/");
    }

    const userCount = await client.user.count();
    if (userCount === 0) {
        redirect(302, "/setup-wizard");
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
                    console.error("Missing required environment variables for header authentication");
                    return fail(400, { username: username, password: "", incorrect: true });
                }
                const name = request.headers.get(env.HEADER_NAME);
                const email = request.headers.get(env.HEADER_EMAIL);
                if (!name || !email) {
                    console.error("Missing required headers for header authentication");
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
            redirect(302, ref || "/");
        }
    }
    /* End header authentication */

    return {
        enableSignup: config.enableSignup,
        oidcEnabled: isOIDCConfigured()
    };
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = Object.fromEntries(await request.formData());
        const loginData = (await getLoginSchema()).safeParse(formData);
        // check for empty values
        if (!loginData.success) {
            const errors = loginData.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message
                };
            });
            return fail(400, { error: true, errors });
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
        } catch {
            // invalid credentials
            return fail(400, { username: loginData.data.username, password: "", incorrect: true });
        }
    }
};
