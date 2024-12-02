import { auth } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { getSignupSchema } from "$lib/validations";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { hashToken } from "$lib/server/token";
import { getConfig } from "$lib/server/config";
import { env } from "$env/dynamic/private";
import { createUser } from "$lib/server/user";
import { Role } from "$lib/schema";

export const load: PageServerLoad = async ({ locals, request }) => {
    if (locals.user) redirect(302, "/");

    const config = await getConfig();

    const token = new URL(request.url).searchParams.get("token");
    if (token) {
        const signup = await client.signupToken.findFirst({
            where: {
                hashedToken: hashToken(token),
                redeemed: false
            },
            select: {
                id: true,
                createdAt: true
            }
        });

        if (!signup) error(400, "reset token not found");

        const expiresIn = (env.TOKEN_TIME ? Number.parseInt(env.TOKEN_TIME) : 72) * 3600000;
        const expiry = signup.createdAt.getTime() + expiresIn;
        if (Date.now() < expiry) {
            return { valid: true, id: signup.id };
        }
        error(400, "Invite code is either invalid or already been used");
    }
    if (!config.enableSignup) {
        error(404, "This instance is invite only");
    }
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = Object.fromEntries(await request.formData());
        const signupSchema = await getSignupSchema();
        const signupData = signupSchema.safeParse(formData);

        // check for empty values
        if (!signupData.success) {
            const errors = signupData.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message
                };
            });
            return fail(400, { error: true, errors });
        }

        const userCount = await client.user.count();
        try {
            const user = await createUser(
                {
                    username: signupData.data.username,
                    email: signupData.data.email,
                    name: signupData.data.name
                },
                userCount > 0 ? Role.USER : Role.ADMIN,
                signupData.data.password,
                signupData.data.tokenId
            );

            const session = await auth.createSession(user.id, {});
            const sessionCookie = auth.createSessionCookie(session.id);
            cookies.set(sessionCookie.name, sessionCookie.value, {
                path: "/",
                ...sessionCookie.attributes
            });
            return { success: true };
        } catch {
            return fail(400, {
                error: true,
                errors: [{ field: "username", message: "User with username or email already exists" }]
            });
        }
    }
};
