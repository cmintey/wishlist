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
import type { Prisma } from "$lib/generated/prisma/client";
import { createImage, tryDeleteImage } from "$lib/server/image-util";
import { getFormatter } from "$lib/server/i18n";
import { hashPassword, verifyPasswordHash } from "$lib/server/password";
import { getOIDCConfig } from "$lib/server/openid";
import { logger } from "$lib/server/logger";
import { generateApiKey, listApiKeys, deleteApiKey } from "$lib/server/api-keys";

export const load: PageServerLoad = async ({ locals, fetch }) => {
    const user = requireLogin();

    const oidcConfig = await getOIDCConfig(fetch);
    const apiKeys = await listApiKeys(user.id);

    return {
        user,
        isProxyUser: locals.isProxyUser,
        oidcConfig,
        apiKeys
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
            email: z.email()
        });
        const nameData = schema.safeParse(formData);
        if (!nameData.success) {
            return fail(400, { error: true, errors: z.flattenError(nameData.error).fieldErrors });
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
            const err = e as Prisma.PrismaClientKnownRequestError;
            logger.error({ err: e });
            const targets = err.meta?.target as string[];
            const errors = targets.reduce(
                (prev, target) => ({
                    ...prev,
                    [target]: [$t("errors.username-already-in-use", { values: { username: target } })]
                }),
                {}
            );
            return fail(400, {
                error: true,
                errors
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
        return filename;
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
    },

    createApiKey: async ({ request }) => {
        const user = requireLogin();
        const formData = await request.formData();
        const name = formData.get("name")?.toString() || "API Key";
        
        const expiresAtStr = formData.get("expiresAt")?.toString();
        const expiresAt = expiresAtStr ? new Date(expiresAtStr) : undefined;

        const { key } = await generateApiKey(user.id, name, expiresAt);

        return {
            newApiKey: key
        };
    },

    deleteApiKey: async ({ request }) => {
        const user = requireLogin();
        const formData = await request.formData();
        const id = formData.get("id")?.toString();

        if (!id) {
            return fail(400, { error: true });
        }

        await deleteApiKey(id, user.id);
    }
};
