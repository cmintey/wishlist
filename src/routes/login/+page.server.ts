import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import type { PageServerLoad, Actions } from "./$types";
import { loginSchema } from "$lib/validations";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";
import { LegacyScrypt } from "lucia";

export const load: PageServerLoad = async ({ locals, request }) => {
    if (locals.user) {
        const ref = new URL(request.url).searchParams.get("ref");
        redirect(302, ref || "/");
    }

    const userCount = await client.user.count();
    if (userCount === 0) {
        redirect(302, "/setup-wizard");
    }

    const config = await getConfig();
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
