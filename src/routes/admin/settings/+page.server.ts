import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { getConfig, writeConfig } from "$lib/server/config";
import { redirect, error, fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { sendTest } from "$lib/server/email";
import { settingSchema } from "$lib/validations";
import type { z } from "zod";
import { getFormatter } from "$lib/i18n";

export const load: PageServerLoad = async ({ locals }) => {
    const $t = await getFormatter();
    if (!locals.user) {
        redirect(302, `/login?ref=/admin`);
    }
    if (locals.user.roleId !== Role.ADMIN) {
        error(401, $t("errors.not-authorized"));
    }

    const config = await getConfig(undefined, true);

    const groups = await client.group.findMany({
        select: {
            id: true,
            name: true
        }
    });

    return {
        config,
        groups
    };
};

export const actions: Actions = {
    "send-test": async ({ locals }) => {
        if (!locals.user) return fail(400);
        await sendTest(locals.user.email);
        return { action: "send-test", success: true };
    },
    settings: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        const configData = settingSchema.safeParse(formData);

        if (!configData.success) {
            const errors = configData.error.errors.map((error) => {
                return {
                    field: error.path[0],
                    message: error.message
                };
            });
            return fail(400, { action: "settings", error: true, errors });
        }

        const newConfig = generateConfig(configData.data);
        await writeConfig(newConfig);

        return { action: "settings", success: true };
    }
};

const generateConfig = (configData: z.infer<typeof settingSchema>) => {
    const smtpConfig: SMTPConfig = configData.enableSMTP
        ? {
              enable: true,
              host: configData.smtpHost!,
              port: configData.smtpPort!,
              user: configData.smtpUser!,
              pass: configData.smtpPass!,
              from: configData.smtpFrom!,
              fromName: configData.smtpFromName!
          }
        : {
              enable: false,
              host: configData.smtpHost,
              port: configData.smtpPort,
              user: configData.smtpUser,
              pass: configData.smtpPass,
              from: configData.smtpFrom,
              fromName: configData.smtpFromName
          };

    const newConfig: Config = {
        enableSignup: configData.enableSignup,
        suggestions: {
            enable: configData.enableSuggestions,
            method: configData.suggestionMethod
        },
        smtp: smtpConfig,
        claims: {
            showName: configData.claimsShowName
        },
        listMode: "standard",
        security: {
            passwordStrength: configData.passwordStrength
        },
        defaultGroup: configData.defaultGroup,
        enableDefaultListCreation: configData.enableDefaultListCreation,
        allowPublicLists: configData.allowPublicLists
    };

    return newConfig;
};
