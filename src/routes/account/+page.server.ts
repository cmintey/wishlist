import {
    createSession,
    generateSessionToken,
    invalidateSession,
    invalidateUserSessions,
    requireLogin,
    setSessionTokenCookie
} from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { getResetPasswordSchema } from "$lib/validations";
import { fail } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createImage, tryDeleteImage } from "$lib/server/image-util";
import { getFormatter } from "$lib/i18n";
import { hashPassword, verifyPasswordHash } from "$lib/server/password";
import { getOIDCConfig } from "$lib/server/openid";

export const load: PageServerLoad = async ({ locals }) => {
    const user = requireLogin();

    const oidcConfig = await getOIDCConfig();

    return {
        user,
        isProxyUser: locals.isProxyUser,
        oidcConfig
    };
};

export const actions: Actions = {
    profile: async ({ request }) => {
        const user = requireLogin();
        const $t = await getFormatter();

        const formData = Object.fromEntries(await request.formData());
        const schema = z.object({
            name: z.string().trim().min(1, $t("errors.name-must-not-be-blank")),
            username: z.string().trim().min(1, $t("errors.username-must-not-be-blank")),
            email: z.string().email()
        });
        const nameData = schema.safeParse(formData);
        // check for empty values
        if (!nameData.success) {
            const errors = nameData.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message
                };
            });
            return fail(400, { error: true, errors });
        }

        try {
            await client.user.update({
                data: {
                    name: nameData.data.name,
                    username: nameData.data.username,
                    email: nameData.data.email
                },
                where: {
                    username: user.username
                }
            });
        } catch (e) {
            const err = e as PrismaClientKnownRequestError;
            console.log(e);
            const targets = err.meta?.target as string[];
            return fail(400, {
                error: true,
                errors: [
                    {
                        field: "username",
                        message: $t("errors.username-already-in-use", { values: { username: targets[0] } })
                    }
                ]
            });
        }
    },

    profilePicture: async ({ request }) => {
        const authUser = requireLogin();

        const form = await request.formData();
        const image = form.get("profilePic") as File;

        const filename = await createImage(authUser.username, image);

        if (filename) {
            const user = await client.user.findUniqueOrThrow({
                select: {
                    picture: true
                },
                where: {
                    id: authUser.id
                }
            });
            await client.user.update({
                where: {
                    id: authUser.id
                },
                data: {
                    picture: filename
                }
            });
            if (user.picture) {
                await tryDeleteImage(user.picture);
            }
        }
    },

    passwordchange: async ({ request, cookies }) => {
        const authUser = requireLogin();
        const $t = await getFormatter();

        const formData = Object.fromEntries(await request.formData());
        const resetPasswordSchema = await getResetPasswordSchema();
        const pwdData = resetPasswordSchema.safeParse(formData);

        if (!pwdData.success) {
            const errors = pwdData.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message
                };
            });
            return fail(400, { error: true, errors });
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
                    errors: [{ field: "currentPassword", message: $t("errors.incorrect-password") }]
                });
            }
        } catch {
            return fail(400, {
                error: true,
                errors: [{ field: "currentPassword", message: $t("errors.incorrect-password") }]
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
                await invalidateSession(authUser.id);
                setSessionTokenCookie(cookies, sessionToken, session.expiresAt);
            }
        } catch {
            return fail(400, {
                error: true,
                errors: [{ field: "newPassword", message: $t("setup.unable-to-update-password") }]
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
