import { invalidateUserSessions } from "$lib/server/auth";
import { getResetPasswordSchema } from "$lib/server/validations";
import { error, fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { getFormatter } from "$lib/server/i18n";
import { hashPassword } from "$lib/server/password";
import { logger } from "$lib/server/logger";
import { passwordResetRepository } from "$lib/server/db/passwordReset.repository";
import { userRepository } from "$lib/server/db/user.repository";

export const load: PageServerLoad = async ({ url }) => {
    const $t = await getFormatter();
    const token = url.searchParams.get("token");

    if (token) {
        const reset = await passwordResetRepository.findByToken(token);

        if (!reset || reset.redeemed) error(400, $t("errors.reset-token-not-found"));

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

        const user = await userRepository.findById(pwdData.data.userId);

        if (!user) {
            logger.error("Could not find user by id");
            error(404, $t("general.oops"));
        }

        try {
            const [_, hashedPassword] = await Promise.all([
                await invalidateUserSessions(user.id),
                await hashPassword(pwdData.data.newPassword)
            ]);

            await userRepository.update(user.id, { hashedPassword });
            await passwordResetRepository.update(pwdData.data.id, { redeemed: true });
        } catch (err) {
            logger.error({ err }, "Failed to update password");
            error(422, $t("setup.unable-to-update-password"));
        }
        redirect(302, url.searchParams.get("redirectTo") ?? "/");
    }
};
