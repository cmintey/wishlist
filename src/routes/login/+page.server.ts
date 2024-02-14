import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import type { PageServerLoad, Actions } from "./$types";
import { loginSchema } from "$lib/validations";
import { getConfig } from "$lib/server/config";
import { client } from "$lib/server/prisma";

export const load: PageServerLoad = async ({ locals, request }) => {
    const session = await locals.validate();

    if (session) {
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
    default: async ({ request, locals }) => {
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
            const key = await auth.useKey("username", loginData.data.username, loginData.data.password);
            const session = await auth.createSession({
                userId: key.userId,
                attributes: {}
            });
            locals.setSession(session);
        } catch (e) {
            // invalid credentials
            return fail(400, { username: loginData.data.username, password: "", incorrect: true });
        }
    }
};
