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
    LIST_MODE = "listMode"
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

    const config: Config = {
        enableSignup: configMap[ConfigKey.SIGNUP_ENABLE] === "true",
        suggestions: {
            enable: configMap[ConfigKey.SUGGESTIONS_ENABLE] === "true",
            method: (configMap[ConfigKey.SUGGESTIONS_METHOD] as SuggestionMethod) || "approval"
        },
        smtp: smtpConfig,
        claims: {
            showName: configMap[ConfigKey.CLAIMS_SHOW_NAME] === "true"
        },
        listMode: (configMap[ConfigKey.LIST_MODE] as ListMode) || "standard"
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
            showName: true
        },
        listMode: "standard"
    };

    await writeConfig(defaultConfig);
};

export const writeConfig = async (config: Partial<Config>, groupId = GLOBAL) => {
    const configMap: Record<string, string | null | undefined> = {};

    if (config.smtp) {
        configMap[ConfigKey.SMTP_ENABLE] = config?.smtp?.enable.toString();
        configMap[ConfigKey.SMTP_HOST] = config?.smtp?.host;
        configMap[ConfigKey.SMTP_PORT] = config?.smtp?.port?.toString();
        configMap[ConfigKey.SMTP_USER] = config?.smtp?.user;
        configMap[ConfigKey.SMTP_PASS] = config?.smtp?.pass;
        configMap[ConfigKey.SMTP_FROM] = config?.smtp?.from;
        configMap[ConfigKey.SMTP_FROM_NAME] = config?.smtp?.fromName;
    }

    configMap[ConfigKey.SIGNUP_ENABLE] = config?.enableSignup?.toString();
    configMap[ConfigKey.SUGGESTIONS_ENABLE] = config?.suggestions?.enable.toString();
    configMap[ConfigKey.SUGGESTIONS_METHOD] = config?.suggestions?.method;
    configMap[ConfigKey.CLAIMS_SHOW_NAME] = config?.claims?.showName.toString();
    configMap[ConfigKey.LIST_MODE] = config?.listMode;

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
