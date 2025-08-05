import { invalidateUserSessions } from "$lib/server/auth";
import { client } from "$lib/server/prisma";
import { hashToken } from "$lib/server/token";
import { getResetPasswordSchema } from "$lib/server/validations";
import { error, fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { getFormatter } from "$lib/server/i18n";
import { hashPassword } from "$lib/server/password";
import { logger } from "$lib/server/logger";

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
            return { userId: reset.userId, id: reset.id };
        }
    }

    error(400, $t("errors.reset-token-not-found"));
};

export const actions: Actions = {
    default: async ({ request, url }) => {
        const $t = await getFormatter();
        const formData = Object.fromEntries(await request.formData());
        const resetPasswordSchema = await getResetPasswordSchema();
        const schema = resetPasswordSchema.and(
            z.object({
                userId: z.string(),
                id: z.uuid()
            })
        );
        const pwdData = schema.safeParse({
            ...formData,
            oldPassword: "reset",
            newPassword: formData.password
        });

        if (!pwdData.success) {
            return fail(400, { error: true, errors: z.flattenError(pwdData.error).fieldErrors });
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

        if (!user) {
            logger.error("Could not find user by id");
            error(404, $t("general.oops"));
        }

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
        } catch (err) {
            logger.error({ err }, "Failed to update password");
            error(422, $t("setup.unable-to-update-password"));
        }
        redirect(302, url.searchParams.get("redirectTo") ?? "/");
    }
};
