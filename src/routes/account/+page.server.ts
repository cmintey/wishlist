import {
    createSession,
    generateSessionToken,
    invalidateSession,
    invalidateUserSessions,
    requireLogin,
    setSessionTokenCookie
} from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { getResetPasswordSchema } from "$lib/server/validations";
import { fail } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";
import { getFormatter } from "$lib/server/i18n";
import { hashPassword, verifyPasswordHash } from "$lib/server/password";
import { getOIDCConfig } from "$lib/server/openid";
import { updatePicture, updateProfile } from "$lib/server/profile";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    const user = requireLogin();

    const oidcConfig = await getOIDCConfig(fetch);

    return {
        user,
        isProxyUser: locals.isProxyUser,
        oidcConfig
    };
};

export const actions: Actions = {
    profile: async ({ request }) => {
        const user = requireLogin();
        return request.formData().then((fd) => updateProfile(user.id, fd));
    },

    profilePicture: async ({ request }) => {
        const authUser = requireLogin();
        return request.formData().then((fd) => updatePicture(authUser.id, authUser.username, fd));
    },

    passwordchange: async ({ request, cookies, locals }) => {
        const authUser = requireLogin();
        const $t = await getFormatter();

        const formData = Object.fromEntries(await request.formData());
        const resetPasswordSchema = await getResetPasswordSchema();
        const pwdData = resetPasswordSchema.safeParse(formData);

        if (!pwdData.success) {
            return fail(400, { error: true, errors: z.flattenError(pwdData.error).fieldErrors });
        }

        try {
            const user = await client.user.findUniqueOrThrow({
                select: {
                    hashedPassword: true
                },
                where: {
                    id: authUser.id
                }
            });

            const validPassword = await verifyPasswordHash(user.hashedPassword, pwdData.data.oldPassword);
            if (!validPassword) {
                return fail(400, {
                    error: true,
                    errors: {
                        currentPassword: [$t("errors.incorrect-password")]
                    }
                });
            }
        } catch {
            return fail(400, {
                error: true,
                errors: {
                    currentPassword: [$t("errors.incorrect-password")]
                }
            });
        }

        try {
            const newHashedPassword = await hashPassword(pwdData.data.newPassword);
            await client.user.update({
                data: {
                    hashedPassword: newHashedPassword
                },
                where: {
                    id: authUser.id
                }
            });
            const sessionToken = generateSessionToken();
            const session = await createSession(sessionToken, authUser.id);
            if (pwdData.data.invalidateSessions) {
                await invalidateUserSessions(authUser.id);
            } else {
                await invalidateSession(locals.session!.id);
                setSessionTokenCookie(cookies, sessionToken, session.expiresAt);
            }
        } catch {
            return fail(400, {
                error: true,
                errors: {
                    newPassword: $t("setup.unable-to-update-password")
                }
            });
        }
    },

    unlinkoauth: async () => {
        const user = requireLogin();

        await client.user.update({
            data: {
                oauthId: null
            },
            where: {
                id: user.id
            }
        });
    }
};
