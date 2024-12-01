import { fail, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { auth } from "$lib/server/auth";
import { loginSchema } from "$lib/validations";
import { getConfig } from "$lib/server/config";
import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { LegacyScrypt } from "lucia";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals, request, cookies }) => {
    const config = await getConfig();
    const ref = new URL(request.url).searchParams.get("ref");
    if (locals.user) {
        redirect(302, ref || "/");
    }

    /* Header authentication */
    if (env.HEADER_AUTH_ENABLED) {
        const username = request.headers.get(env.HEADER_USERNAME);
        if (username) {
            let user = await client.user.findUnique({
                select: {
                    id: true,
                },
                where: {
                    username: username
                }
            });
    
            if (!user) {
                if(!env.HEADER_EMAIL || !env.HEADER_NAME) {
                    return fail(400, { username: username, password: "", incorrect: true });
                }
                const name = request.headers.get(env.HEADER_NAME);
                const email = request.headers.get(env.HEADER_EMAIL);
                if(!name || !email) {
                    return fail(400, { username: username, password: "", incorrect: true });
                }
                const userCount = await client.user.count();
                user = await client.user.create({
                    select: {
                        id: true
                    },
                    data: {
                        username: username,
                        email: email,
                        hashedPassword: "",
                        name: name,
                        roleId: userCount > 0 ? Role.USER : Role.ADMIN
                    }
                });
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
    
            const session = await auth.createSession(user.id, {});
            const sessionCookie = auth.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, {
                path: "/",
                ...sessionCookie.attributes
            });
            redirect(302, ref || "/");
        }
    }
    /* End header authentication */

    const userCount = await client.user.count();
    if (userCount === 0) {
        redirect(302, "/setup-wizard");
    }

    return { enableSignup: config.enableSignup };
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = Object.fromEntries(await request.formData());
        const loginData = loginSchema.safeParse(formData);
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

            const isValid = await new LegacyScrypt().verify(maybeUser.hashedPassword, loginData.data.password);
            if (!isValid) {
                return fail(400, { username: loginData.data.username, password: "", incorrect: true });
            }

            const session = await auth.createSession(maybeUser.id, {});
            const sessionCookie = auth.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, {
                path: "/",
                ...sessionCookie.attributes
            });
        } catch {
            // invalid credentials
            return fail(400, { username: loginData.data.username, password: "", incorrect: true });
        }
    }
};