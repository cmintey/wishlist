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
    ClAIMS_SHOW_NAME_ACROSS_GROUPS = "claims.showNameAcrossGroups",
    CLAIMS_SHOW_FOR_OWNER = "claims.showForOwner",
    CLAIMS_SHOW_NAME_PUBLIC = "claims.showNamePublic",
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
    OIDC_AUTO_REGISTER = "oidc.autoRegister",
    OIDC_ENABLE_SYNC = "oidc.enableSync",
    OIDC_DISABLE_EMAIL_VERIFICATION = "oidc.disableEmailVerification"
}

type Transformer<T> = (val: string | null, shouldMask?: boolean) => T;

const isDefined = (val: string | null | undefined) => val !== null && val !== undefined;
const booleanTransformer: Transformer<boolean | undefined> = (val) =>
    val === "true" ? true : val === "false" ? false : undefined;
const stringTransformer: Transformer<string | undefined> = (val) => val ?? undefined;
const maskableStringTransformer: Transformer<string | undefined> = (val, shouldMask = false) =>
    isDefined(val) ? maskable(val, shouldMask) : undefined;
const numberTransformer: Transformer<number | undefined> = (val) => (isDefined(val) ? Number(val) : undefined);

const transformers: Record<ConfigKey, Transformer<unknown>> = {
    enableSignup: booleanTransformer,
    "suggestions.enable": booleanTransformer,
    "suggestions.method": stringTransformer,
    "smtp.enable": booleanTransformer,
    "smtp.host": stringTransformer,
    "smtp.port": numberTransformer,
    "smtp.user": stringTransformer,
    "smtp.pass": maskableStringTransformer,
    "smtp.from": stringTransformer,
    "smtp.fromName": stringTransformer,
    "claims.showName": booleanTransformer,
    "claims.showNameAcrossGroups": booleanTransformer,
    "claims.showForOwner": booleanTransformer,
    "claims.showNamePublic": booleanTransformer,
    "claims.requireEmail": booleanTransformer,
    listMode: stringTransformer,
    "security.passwordStrength": numberTransformer,
    "security.disablePasswordLogin": booleanTransformer,
    defaultGroup: stringTransformer,
    enableDefaultListCreation: booleanTransformer,
    allowPublicLists: booleanTransformer,
    "oidc.enable": booleanTransformer,
    "oidc.clientId": stringTransformer,
    "oidc.clientSecret": maskableStringTransformer,
    "oidc.discoveryUrl": stringTransformer,
    "oidc.providerName": stringTransformer,
    "oidc.autoRedirect": booleanTransformer,
    "oidc.autoRegister": booleanTransformer,
    "oidc.enableSync": booleanTransformer,
    "oidc.disableEmailVerification": booleanTransformer
};

const getDefaultConfig = (): Config => ({
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
        showNameAcrossGroups: false,
        showForOwner: false,
        showNamePublic: false,
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
});

function buildConfig(configMap: Record<string, string | null>, includeSensitive = false): Config {
    const config: Partial<Config> = {};

    for (const [key, value] of Object.entries(configMap)) {
        if (key in transformers) {
            const transformer: Transformer<unknown> = transformers[key as ConfigKey];
            const path = key.split(".");
            setDeep(config, path, transformer(value, !includeSensitive));
        }
    }

    return deepMerge(getDefaultConfig(), config) as Config;
}

function setDeep(obj: Record<string, any>, path: string[], value: any) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
        if (!(path[i] in current)) current[path[i]] = {};
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
}

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, unknown> {
    for (const key in source) {
        if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

function flatten(
    obj: Record<string, any>,
    prefix = "",
    result: Record<string, string | null | undefined> = {}
): Record<string, string | null | undefined> {
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
            result[fullKey] = value;
        } else if (typeof value === "object" && !Array.isArray(value)) {
            flatten(value, fullKey, result);
        } else if (typeof value === "number" || typeof value === "boolean") {
            result[fullKey] = value.toString();
        } else {
            result[fullKey] = value;
        }
    }
    return result;
}

export const getConfig = async (groupId?: string, includeSensitive = false): Promise<Config> => {
    const configItems = await client.systemConfig.findMany({
        where: {
            groupId: "global"
        }
    });

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

    return buildConfig(configMap, includeSensitive);
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

export const writeConfig = async (config: Partial<Config>, groupId = GLOBAL) => {
    const configMap: Record<string, string | null | undefined> = flatten(config);

    await client.$transaction(
        Object.entries(configMap).map(([key, value]) =>
            client.systemConfig.upsert({
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
            })
        )
    );
};

const maskable = (value: string, mask: boolean) => {
    return mask ? "*****" : value;
};
