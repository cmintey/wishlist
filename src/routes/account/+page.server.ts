import {
    createSession,
    generateSessionToken,
    invalidateSession,
    invalidateUserSessions,
    setSessionTokenCookie
} from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { getResetPasswordSchema } from "$lib/validations";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";
import type { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createImage, tryDeleteImage } from "$lib/server/image-util";
import { getFormatter } from "$lib/i18n";
import { hashPassword, verifyPasswordHash } from "$lib/server/password";

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    if (!user) {
        redirect(302, `/login?ref=/account`);
    }

    return {
        user,
        isProxyUser: locals.isProxyUser
    };
};

export const actions: Actions = {
    profile: async ({ request, locals }) => {
        const $t = await getFormatter();
        const user = locals.user;
        if (!user) redirect(302, "/login?ref=/account");

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

    profilePicture: async ({ request, locals }) => {
        if (!locals.user) redirect(302, "/login?ref=/account");

        const form = await request.formData();
        const image = form.get("profilePic") as File;

        const filename = await createImage(locals.user.username, image);

        if (filename) {
            const user = await client.user.findUniqueOrThrow({
                select: {
                    picture: true
                },
                where: {
                    id: locals.user.id
                }
            });
            await client.user.update({
                where: {
                    id: locals.user.id
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

    passwordchange: async ({ request, locals, cookies }) => {
        const $t = await getFormatter();
        if (!(locals.user && locals.session)) redirect(302, "/login?ref=/account");

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
                    id: locals.user.id
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
                    id: locals.user.id
                }
            });
            const sessionToken = generateSessionToken();
            const session = await createSession(sessionToken, locals.user.id);
            if (pwdData.data.invalidateSessions) {
                await invalidateUserSessions(locals.user.id);
            } else {
                await invalidateSession(locals.session.id);
                setSessionTokenCookie(cookies, sessionToken, session.expiresAt);
            }
        } catch {
            return fail(400, {
                error: true,
                errors: [{ field: "newPassword", message: $t("setup.unable-to-update-password") }]
            });
        }
    }
};
