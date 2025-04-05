import { invalidateUserSessions } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { hashToken } from "$lib/server/token";
import { getResetPasswordSchema } from "$lib/validations";
import { error, fail } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { getFormatter } from "$lib/i18n";
import { hashPassword } from "$lib/server/password";

export const load: PageServerLoad = async ({ url }) => {
    const $t = await getFormatter();
    const token = url.searchParams.get("token");

    if (token) {
        const reset = await client.passwordReset.findFirst({
            where: {
                hashedToken: hashToken(token),
                redeemed: false
            },
            select: {
                id: true,
                userId: true,
                createdAt: true
            }
        });

        if (!reset) error(400, $t("errors.reset-token-not-found"));

        const expiresIn = (env.TOKEN_TIME ? Number.parseInt(env.TOKEN_TIME) : 72) * 3600000;
        const expiry = reset.createdAt.getTime() + expiresIn;
        if (Date.now() < expiry) {
            return { valid: true, userId: reset.userId, id: reset.id };
        }
    }

    return { valid: false };
};

export const actions: Actions = {
    default: async ({ request }) => {
        const $t = await getFormatter();
        const formData = Object.fromEntries(await request.formData());
        const resetPasswordSchema = await getResetPasswordSchema();
        const schema = resetPasswordSchema.and(
            z.object({
                userId: z.string(),
                id: z.string().uuid()
            })
        );
        const pwdData = schema.safeParse({
            ...formData,
            oldPassword: "reset",
            newPassword: formData.password
        });

        if (!pwdData.success) {
            const errors = pwdData.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message
                };
            });
            return fail(400, { error: true, errors });
        }

        const user = await client.user.findUnique({
            where: {
                id: pwdData.data.userId
            },
            select: {
                id: true,
                username: true
            }
        });

        if (user) {
            try {
                const [_, hashedPassword] = await Promise.all([
                    await invalidateUserSessions(user.id),
                    await hashPassword(pwdData.data.newPassword)
                ]);
                await client.user.update({
                    data: {
                        hashedPassword
                    },
                    where: {
                        id: user.id
                    }
                });
                await client.passwordReset.update({
                    where: {
                        id: pwdData.data.id
                    },
                    data: {
                        redeemed: true
                    }
                });
                return { success: true };
            } catch {
                return fail(400, {
                    error: true,
                    errors: [{ field: "newPassword", message: $t("setup.unable-to-update-password") }]
                });
            }
        }

        return { success: false };
    }
};
