import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { requireLogin, requireLoginOrError } from "$lib/server/auth";
import { z } from "zod";
import { client } from "$lib/server/prisma";
import { logger } from "$lib/server/logger";
import { extractFormData } from "$lib/server/validations";
import { getFormatter } from "$lib/server/i18n";

export const load = (async () => {
    requireLogin();

    redirect(302, "/lists");
}) satisfies PageServerLoad;

export const actions = {
    language: async ({ request }) => {
        const user = await requireLoginOrError();
        const $t = await getFormatter();

        const schema = z.object({
            language: z.string().nullable()
        });
        const result = await request.formData().then((data) => {
            return schema.safeParseAsync({ language: data.get("language") || null });
        });

        if (result.error) {
            return fail(422, { message: $t("errors.language-is-required") });
        }

        try {
            await client.user.update({
                data: {
                    preferredLanguage: result.data.language
                },
                where: {
                    id: user.id
                }
            });
        } catch (err) {
            logger.error({ err, lang: result.data.language, userId: user.id }, "Unable to update user's language");
            error(500, $t("errors.unable-to-update-preferred-language"));
        }
    }
} satisfies Actions;
