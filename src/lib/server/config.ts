import { client } from "./prisma";

const GLOBAL = "global";

enum ConfigKey {
    SIGNUP_ENABLE = "enableSignup",
    SUGGESTIONS_ENABLE = "suggestions.enable",
    SUGGESTIONS_METHOD = "suggestions.method",
    SMTP_ENABLE = "smtp.enable",
    SMTP_HOST = "smtp.host",
    SMTP_PORT = "smtp.port",
    SMTP_USER = "smtp.user",
    SMTP_PASS = "smtp.pass",
    SMTP_FROM = "smtp.from",
    SMTP_FROM_NAME = "smtp.fromName",
    CLAIMS_SHOW_NAME = "claims.showName",
    CLAIMS_REQUIRE_EMAIL = "claims.requireEmail",
    LIST_MODE = "listMode",
    SECURITY_PASSWORD_STRENGTH = "security.passwordStrength",
    SECURITY_DISABLE_PASSWORD_LOGIN = "security.disablePasswordLogin",
    DEFAULT_GROUP = "defaultGroup",
    ENABLE_DEFAULT_LIST_CREATION = "enableDefaultListCreation",
    ALLOW_PUBLIC_LISTS = "allowPublicLists",
    OIDC_ENABLE = "oidc.enable",
    OIDC_DISCOVERY_URL = "oidc.discoveryUrl",
    OIDC_CLIENT_ID = "oidc.clientId",
    OIDC_CLIENT_SECRET = "oidc.clientSecret",
    OIDC_PROVIDER_NAME = "oidc.providerName",
    OIDC_AUTO_REDIRECT = "oidc.autoRedirect",
    OIDC_AUTO_REGISTER = "oidc.autoRegister"
}

export const getConfig = async (groupId?: string, includeSensitive = false): Promise<Config> => {
    let configItems = await client.systemConfig.findMany({
        where: {
            groupId: "global"
        }
    });
    if (configItems.length === 0) {
        await createDefaultConfig();
        configItems = await client.systemConfig.findMany({
            where: {
                groupId: "global"
            }
        });
    }

    let configMap: Record<string, string | null> = {};
    for (const { key, value } of configItems) {
        configMap[key] = value;
    }

    let groupConfigMap: Record<string, string | null> = {};
    if (groupId) groupConfigMap = await getGroupConfig(groupId);
    configMap = {
        ...configMap,
        ...groupConfigMap
    };

    const smtpConfig: SMTPConfig =
        configMap[ConfigKey.SMTP_ENABLE] === "true"
            ? {
                  enable: true,
                  host: configMap[ConfigKey.SMTP_HOST]!,
                  port: Number(configMap[ConfigKey.SMTP_PORT])!,
                  user: configMap[ConfigKey.SMTP_USER]!,
                  pass: maskable(configMap[ConfigKey.SMTP_PASS]!, !includeSensitive),
                  from: configMap[ConfigKey.SMTP_FROM]!,
                  fromName: configMap[ConfigKey.SMTP_FROM_NAME]!
              }
            : {
                  enable: false,
                  host: configMap[ConfigKey.SMTP_HOST],
                  port: Number(configMap[ConfigKey.SMTP_PORT]),
                  user: configMap[ConfigKey.SMTP_USER],
                  pass: maskable(configMap[ConfigKey.SMTP_PASS]!, !includeSensitive),
                  from: configMap[ConfigKey.SMTP_FROM],
                  fromName: configMap[ConfigKey.SMTP_FROM_NAME]
              };

    const oidcConfig: OIDCConfig =
        configMap[ConfigKey.OIDC_ENABLE] === "true"
            ? {
                  enable: true,
                  discoveryUrl: configMap[ConfigKey.OIDC_DISCOVERY_URL]!,
                  clientId: configMap[ConfigKey.OIDC_CLIENT_ID]!,
                  clientSecret: maskable(configMap[ConfigKey.OIDC_CLIENT_SECRET]!, !includeSensitive),
                  providerName: configMap[ConfigKey.OIDC_PROVIDER_NAME],
                  autoRedirect: configMap[ConfigKey.OIDC_AUTO_REDIRECT] === "true",
                  autoRegister: configMap[ConfigKey.OIDC_AUTO_REGISTER] === "true"
              }
            : {
                  enable: false,
                  discoveryUrl: configMap[ConfigKey.OIDC_DISCOVERY_URL],
                  clientId: configMap[ConfigKey.OIDC_CLIENT_ID],
                  clientSecret: configMap[ConfigKey.OIDC_CLIENT_SECRET]
                      ? maskable(configMap[ConfigKey.OIDC_CLIENT_SECRET], !includeSensitive)
                      : undefined,
                  providerName: configMap[ConfigKey.OIDC_PROVIDER_NAME],
                  autoRedirect: configMap[ConfigKey.OIDC_AUTO_REDIRECT] === "true",
                  autoRegister: configMap[ConfigKey.OIDC_AUTO_REGISTER] === "true"
              };

    const config: Config = {
        enableSignup: configMap[ConfigKey.SIGNUP_ENABLE] === "true",
        suggestions: {
            enable: configMap[ConfigKey.SUGGESTIONS_ENABLE] === "true",
            method: (configMap[ConfigKey.SUGGESTIONS_METHOD] as SuggestionMethod) || "approval"
        },
        smtp: smtpConfig,
        claims: {
            showName: configMap[ConfigKey.CLAIMS_SHOW_NAME] === "true",
            requireEmail: configMap[ConfigKey.CLAIMS_REQUIRE_EMAIL] === "true"
        },
        listMode: (configMap[ConfigKey.LIST_MODE] as ListMode) || "standard",
        security: {
            passwordStrength: Number(configMap[ConfigKey.SECURITY_PASSWORD_STRENGTH] || 2),
            disablePasswordLogin: configMap[ConfigKey.SECURITY_DISABLE_PASSWORD_LOGIN] === "true"
        },
        defaultGroup: configMap[ConfigKey.DEFAULT_GROUP]!,
        enableDefaultListCreation: configMap[ConfigKey.ENABLE_DEFAULT_LIST_CREATION] !== "false", // do it this way since we want it to be defaulted to true
        allowPublicLists: configMap[ConfigKey.ALLOW_PUBLIC_LISTS] === "true",
        oidc: oidcConfig
    };

    return config;
};

const getGroupConfig = async (groupId: string): Promise<Record<string, string | null>> => {
    const configItems = await client.systemConfig.findMany({
        where: {
            groupId
        }
    });

    const configMap: Record<string, string | null> = {};
    for (const { key, value } of configItems) {
        configMap[key] = value;
    }

    return configMap;
};

const createDefaultConfig = async (): Promise<void> => {
    const defaultConfig: Config = {
        enableSignup: true,
        suggestions: {
            enable: true,
            method: "approval"
        },
        smtp: {
            enable: false
        },
        claims: {
            showName: true,
            requireEmail: true
        },
        listMode: "standard",
        security: {
            passwordStrength: 2,
            disablePasswordLogin: false
        },
        enableDefaultListCreation: true,
        allowPublicLists: false,
        oidc: {
            enable: false
        }
    };

    await writeConfig(defaultConfig);
};

export const writeConfig = async (config: Partial<Config>, groupId = GLOBAL) => {
    const configMap: Record<string, string | null | undefined> = {};

    if (config.smtp) {
        configMap[ConfigKey.SMTP_ENABLE] = config.smtp.enable.toString();
        configMap[ConfigKey.SMTP_HOST] = config.smtp.host;
        configMap[ConfigKey.SMTP_PORT] = config.smtp.port?.toString();
        configMap[ConfigKey.SMTP_USER] = config.smtp.user;
        configMap[ConfigKey.SMTP_PASS] = config.smtp.pass;
        configMap[ConfigKey.SMTP_FROM] = config.smtp.from;
        configMap[ConfigKey.SMTP_FROM_NAME] = config.smtp.fromName;
    }

    if (config.oidc) {
        configMap[ConfigKey.OIDC_ENABLE] = config.oidc.enable.toString();
        configMap[ConfigKey.OIDC_DISCOVERY_URL] = config.oidc.discoveryUrl;
        configMap[ConfigKey.OIDC_CLIENT_ID] = config.oidc.clientId;
        configMap[ConfigKey.OIDC_CLIENT_SECRET] = config.oidc.clientSecret;
        configMap[ConfigKey.OIDC_PROVIDER_NAME] = config.oidc.providerName;
        configMap[ConfigKey.OIDC_AUTO_REDIRECT] = config.oidc.autoRedirect?.toString();
        configMap[ConfigKey.OIDC_AUTO_REGISTER] = config.oidc.autoRegister?.toString();
    }

    configMap[ConfigKey.SIGNUP_ENABLE] = config.enableSignup?.toString();
    configMap[ConfigKey.SUGGESTIONS_ENABLE] = config.suggestions?.enable.toString();
    configMap[ConfigKey.SUGGESTIONS_METHOD] = config.suggestions?.method;
    configMap[ConfigKey.CLAIMS_SHOW_NAME] = config.claims?.showName.toString();
    configMap[ConfigKey.CLAIMS_REQUIRE_EMAIL] = config.claims?.requireEmail.toString();
    configMap[ConfigKey.LIST_MODE] = config.listMode;
    configMap[ConfigKey.SECURITY_PASSWORD_STRENGTH] = config.security?.passwordStrength.toString();
    configMap[ConfigKey.SECURITY_DISABLE_PASSWORD_LOGIN] = config.security?.disablePasswordLogin.toString();
    configMap[ConfigKey.DEFAULT_GROUP] = config.defaultGroup;
    configMap[ConfigKey.ENABLE_DEFAULT_LIST_CREATION] = config.enableDefaultListCreation?.toString();
    configMap[ConfigKey.ALLOW_PUBLIC_LISTS] = config?.allowPublicLists?.toString();

    for (const [key, value] of Object.entries(configMap)) {
        await client.systemConfig.upsert({
            where: {
                key_groupId: {
                    key,
                    groupId
                }
            },
            create: {
                key,
                groupId,
                value
            },
            update: {
                value
            }
        });
    }
};

const maskable = (value: string, mask: boolean) => {
    return mask ? "*****" : value;
};
