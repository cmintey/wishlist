import { createSession, generateSessionToken, setSessionTokenCookie } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { getSignupSchema } from "$lib/validations";
import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { hashToken } from "$lib/server/token";
import { getConfig } from "$lib/server/config";
import { env } from "$env/dynamic/private";
import { createUser } from "$lib/server/user";
import { Role } from "$lib/schema";
import { getFormatter } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals, url }) => {
    if (locals.user) redirect(302, url.searchParams.get("redirectTo") ?? "/");

    const $t = await getFormatter();
    const config = await getConfig();

    const token = url.searchParams.get("token");
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

        if (!signup) error(400, $t("errors.reset-token-not-found"));

        if (validateToken(signup.createdAt)) {
            return { valid: true, id: signup.id };
        }
        error(400, $t("errors.invite-code-invalid"));
    }
    if (!config.enableSignup) {
        error(401, $t("errors.this-instance-is-invite-only"));
    }
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = Object.fromEntries(await request.formData());
        const signupSchema = await getSignupSchema();
        const signupData = signupSchema.safeParse(formData);
        const $t = await getFormatter();

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

        const config = await getConfig();

        if (!config.enableSignup) {
            if (!signupData.data.tokenId) {
                error(401, $t("errors.this-instance-is-invite-only"));
            }
            const signup = await client.signupToken.findUnique({
                where: {
                    id: signupData.data.tokenId
                },
                select: {
                    createdAt: true,
                    redeemed: true
                }
            });

            if (!signup || signup.redeemed || !validateToken(signup.createdAt)) {
                error(400, $t("errors.invite-code-invalid"));
            }
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

            const sessionToken = generateSessionToken();
            const session = await createSession(sessionToken, user.id);
            setSessionTokenCookie(cookies, sessionToken, session.expiresAt);
            return { success: true };
        } catch {
            return fail(400, {
                error: true,
                errors: [{ field: "username", message: $t("errors.user-already-exists") }]
            });
        }
    }
};

function validateToken(createdAt: Date) {
    const expiresIn = (env.TOKEN_TIME ? Number.parseInt(env.TOKEN_TIME) : 72) * 3600000;
    const expiry = createdAt.getTime() + expiresIn;
    return Date.now() < expiry;
}
