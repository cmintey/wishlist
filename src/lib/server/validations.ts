import { z } from "zod";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import { loadOptions, meterLabel } from "$lib/zxcvbn";
import { getConfig } from "./config";
import { getFormatter } from "./i18n";
import { getLocale } from "$lib/server/i18n";

const passwordZxcvbn = async (minScore: number) => {
    await loadOptions(getLocale()).then((options) => zxcvbnOptions.setOptions(options));
    const $t = await getFormatter();
    const minStrength = $t(meterLabel[minScore]);
    const message = $t("errors.password-min-strength", { values: { minStrength } });
    return z
        .string()
        .min(1, $t("errors.password-must-not-be-blank"))
        .refine((pass) => zxcvbn(pass).score >= minScore, { message });
};

export const getLoginSchema = async () => {
    const $t = await getFormatter();
    return z.object({
        username: z.string().trim().min(1, $t("errors.username-must-not-be-blank")),
        password: z.string().min(1, $t("errors.password-must-not-be-blank"))
    });
};

export const getResetPasswordSchema = async () => {
    const { security } = await getConfig();
    return z.object({
        oldPassword: z.string().min(1),
        newPassword: await passwordZxcvbn(security.passwordStrength),
        invalidateSessions: z.coerce.boolean().default(false)
    });
};

export const getSignupSchema = async () => {
    const $t = await getFormatter();
    const { security } = await getConfig();
    return z.object({
        name: z.string().trim().min(1, $t("errors.name-must-not-be-blank")),
        username: z.string().trim().min(1, $t("errors.username-must-not-be-blank")),
        email: z.string().email(),
        password: await passwordZxcvbn(security.passwordStrength),
        tokenId: z.string().optional()
    });
};

export const settingSchema = z.object({
    enableSignup: z.coerce.boolean().default(false),
    enableSuggestions: z.coerce.boolean().default(false),
    suggestionMethod: z.enum(["surprise", "auto-approval", "approval"]).default("approval"),
    enableSMTP: z.coerce.boolean().default(false),
    smtpHost: z.string().optional(),
    smtpPort: z.coerce.number().optional(),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),
    smtpFrom: z.string().optional(),
    smtpFromName: z.string().optional(),
    claimsShowName: z.coerce.boolean().default(false),
    listMode: z.enum(["standard", "registry"]).default("standard"),
    passwordStrength: z.coerce.number().min(-1).max(5).default(2),
    disablePasswordLogin: z.coerce.boolean().default(false),
    defaultGroup: z.string().optional(),
    enableDefaultListCreation: z.coerce.boolean().default(false),
    allowPublicLists: z.coerce.boolean().default(false),
    enableOIDC: z.coerce.boolean().default(false),
    oidcDiscoveryUrl: z.string().optional(),
    oidcClientId: z.string().optional(),
    oidcClientSecret: z.string().optional(),
    oidcProviderName: z.string().optional(),
    oidcAutoRedirect: z.coerce.boolean().default(false),
    oidcAutoRegister: z.coerce.boolean().default(false)
});

export const publicListCreateSchema = z.object({
    public: z.boolean().optional()
});

export const getListPropertiesSchema = () => {
    return z.object({
        name: z.string().trim().nullable(),
        icon: z.string().trim().nullable(),
        iconColor: z.string().trim().nullable(),
        public: z.coerce.boolean().default(false),
        description: z.string().max(10000).nullable()
    });
};

export const listItemsUpdateSchema = z.object({
    itemId: z.number(),
    displayOrder: z.number().nullish()
});

export const listItemUpdateSchema = z.object({
    approved: z.boolean().nullish()
});

export const listItemClaimSchema = z.object({
    quantity: z.number(),
    claimedById: z.string().nullish(),
    publicClaimedById: z.string().nullish()
});

export const listItemClaimUpdateSchema = z.object({
    purchased: z.boolean().nullish(),
    quantity: z.number().optional()
});

export const getItemCreateSchema = async () => {
    const $t = await getFormatter();

    return z.object({
        url: z.string().url().optional(),
        name: z.string(),
        price: z.string().optional(),
        currency: z.string().optional(),
        quantity: z.coerce
            .number()
            .max(999)
            .optional()
            .transform((v) => (v === undefined ? null : v)),
        imageUrl: z.string().optional(),
        image: z.instanceof(File).optional(),
        note: z.string().optional(),
        lists: z
            .union([
                z.string(),
                z.array(z.string()).nonempty({ message: $t("errors.an-item-must-be-added-to-at-least-one-list") })
            ])
            .transform((v) => (typeof v === "string" ? [v] : v))
    });
};

export const getItemUpdateSchema = async () => {
    return getItemCreateSchema().then((itemCreateSchema) =>
        itemCreateSchema.merge(
            z.object({
                url: z.string().nullish().default(null),
                imageUrl: z.string().nullish().default(null),
                note: z.string().nullish().default(null)
            })
        )
    );
};

export const extractFormData = (formData: FormData) => {
    const data = [...formData.entries().filter(([_k, v]) => v.toString())].reduce<
        Record<string, FormDataEntryValue | FormDataEntryValue[]>
    >(
        (data, [key, value]) => ({
            ...data,
            [key]: key in data ? (Array.isArray(data[key]) ? [...data[key], value] : [data[key], value]) : value
        }),
        {}
    );
    return data;
};
