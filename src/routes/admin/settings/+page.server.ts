import { Role } from "$lib/schema";
import { client } from "$lib/server/prisma";
import { getConfig, writeConfig } from "$lib/server/config";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { sendTest } from "$lib/server/email";
import { settingSchema } from "$lib/server/validations";
import type { z } from "zod";
import { requireRole } from "$lib/server/auth";

export const load: PageServerLoad = async () => {
    await requireRole(Role.ADMIN);

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
    "send-test": async () => {
        const user = await requireRole(Role.ADMIN);

        await sendTest(user.email);
        return { action: "send-test", success: true };
    },
    settings: async ({ request }) => {
        await requireRole(Role.ADMIN);

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

    const oidcConfig: OIDCConfig = configData.enableOIDC
        ? {
              enable: true,
              discoveryUrl: configData.oidcDiscoveryUrl!,
              clientId: configData.oidcClientId!,
              clientSecret: configData.oidcClientSecret!,
              providerName: configData.oidcProviderName,
              autoRedirect: configData.oidcAutoRedirect,
              autoRegister: configData.oidcAutoRegister
          }
        : {
              enable: false,
              discoveryUrl: configData.oidcDiscoveryUrl,
              clientId: configData.oidcClientId,
              clientSecret: configData.oidcClientSecret,
              providerName: configData.oidcProviderName,
              autoRedirect: configData.oidcAutoRedirect,
              autoRegister: configData.oidcAutoRegister
          };

    const newConfig: Config = {
        enableSignup: configData.enableSignup,
        suggestions: {
            enable: configData.enableSuggestions,
            method: configData.suggestionMethod
        },
        smtp: smtpConfig,
        claims: {
            showName: configData.claimsShowName,
            requireEmail: configData.claimsRequireEmail
        },
        listMode: "standard",
        security: {
            passwordStrength: configData.passwordStrength,
            disablePasswordLogin: configData.disablePasswordLogin
        },
        defaultGroup: configData.defaultGroup,
        enableDefaultListCreation: configData.enableDefaultListCreation,
        allowPublicLists: configData.allowPublicLists,
        oidc: oidcConfig
    };

    return newConfig;
};
