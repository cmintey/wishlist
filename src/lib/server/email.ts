import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { readFile } from "fs/promises";
import type Mail from "nodemailer/lib/mailer";
import { getConfig } from "$lib/server/config";
import { env } from "$env/dynamic/private";
import { getFormatter } from "$lib/server/i18n";
import { logger } from "$lib/server/logger";

type InviteTemplateData = {
    url: string;
    baseUrl: string;
    wishlistLogoText: string;
    previewText: string;
    titleText: string;
    bodyText: string;
    buttonText: string;
    footerText: string;
};

type PasswordResetTemplateData = Omit<InviteTemplateData, "footerText">;

type ClaimConfirmationTemplateData = InviteTemplateData & {
    itemName: string;
    itemImageUrl?: string;
    listName: string;
    listUrl: string;
    listLinkText: string;
};

type ClaimConfirmationOptions = {
    manageUrl: string;
    listUrl: string;
    listName: string | null;
    itemName: string;
    itemImageUrl?: string;
    locale?: string;
};

// Compiled on first use and cached. Loading these at module load would race
// with the first email sent after startup, which fails if it wins.
const templateCache = new Map<string, HandlebarsTemplateDelegate<any>>();

const getTemplate = async <T>(name: string): Promise<HandlebarsTemplateDelegate<T> | null> => {
    const cached = templateCache.get(name);
    if (cached) return cached;

    try {
        const template = Handlebars.compile<T>(await readFile(`templates/${name}.html`, "utf-8"));
        templateCache.set(name, template);
        return template;
    } catch (err) {
        logger.error({ err }, `Error reading ${name} email template`);
        return null;
    }
};

const templateMissing = (name: string) => ({
    success: false,
    message: `Unable to load the ${name} email template`
});

const sendEmail = async (options: Mail.Options) => {
    const config = await getConfig(undefined, true);

    if (
        !config.smtp.enable ||
        (config.smtp.enable && !config.smtp.host && !config.smtp.port && !config.smtp.from && !config.smtp.fromName)
    ) {
        logger.error("SMTP not set up properly, check your settings");
        return {
            success: false,
            message: "SMTP not set up properly, check your settings"
        };
    }

    const transport = nodemailer.createTransport({
        port: config.smtp.port,
        host: config.smtp.host,
        auth: config.smtp.user && config.smtp.pass ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
        secure: config.smtp.useTls || false,
        tls: {
            rejectUnauthorized: config.smtp.ignoreCertCheck === true ? false : true
        }
    });

    return await transport
        .sendMail({
            from: {
                name: config.smtp.fromName,
                address: config.smtp.from
            },
            ...options
        })
        .then((msgInfo) => ({
            success: msgInfo.accepted.length === 1,
            message: null
        }))
        .catch((e) => {
            logger.error(e);
            return {
                success: false,
                message: e?.response
            };
        });
};

export const sendSignupLink = async (to: string, inviteUrl: string) => {
    const $t = await getFormatter();
    const inviteTempl = await getTemplate<InviteTemplateData>("invite");
    if (!inviteTempl) return templateMissing("invite");
    const html = inviteTempl({
        url: inviteUrl,
        baseUrl: env.ORIGIN || "http://localhost:5173",
        wishlistLogoText: $t("a11y.wishlist-logo"),
        previewText: $t("email.invite-title"),
        titleText: $t("email.invite-title"),
        bodyText: $t("email.invite-body"),
        buttonText: $t("email.invite-button"),
        footerText: $t("email.invite-footer")
    });
    return await sendEmail({
        to,
        subject: $t("email.invite-subject"),
        html,
        text: $t("email.invite-fallback-text", { values: { url: inviteUrl } })
    });
};

export const sendPasswordReset = async (to: string, resetUrl: string) => {
    const $t = await getFormatter();
    const passResetTempl = await getTemplate<PasswordResetTemplateData>("password-reset");
    if (!passResetTempl) return templateMissing("password-reset");
    const html = passResetTempl({
        url: resetUrl,
        baseUrl: env.ORIGIN || "http://localhost:5173",
        wishlistLogoText: $t("a11y.wishlist-logo"),
        previewText: $t("email.pw-reset-title"),
        titleText: $t("email.pw-reset-title"),
        bodyText: $t("email.pw-reset-body"),
        buttonText: $t("email.pw-reset-title")
    });
    return await sendEmail({
        to,
        subject: "Wishlist | " + $t("email.pw-reset-title"),
        html,
        text: $t("email.pw-reset-fallback-text", { values: { url: resetUrl } })
    });
};

export const sendClaimConfirmation = async (to: string, options: ClaimConfirmationOptions) => {
    const { manageUrl, listUrl, listName, itemName, itemImageUrl, locale } = options;
    // The claimer has no account, so the language comes from the list rather
    // than from the request that happened to create the claim
    const $t = await getFormatter(locale);
    const claimConfirmationTempl = await getTemplate<ClaimConfirmationTemplateData>("claim-confirmation");
    if (!claimConfirmationTempl) return templateMissing("claim-confirmation");
    const listDisplayName = listName ?? $t("wishes.a-wishlist");
    const html = claimConfirmationTempl({
        url: manageUrl,
        baseUrl: env.ORIGIN || "http://localhost:5173",
        wishlistLogoText: $t("a11y.wishlist-logo"),
        previewText: $t("email.claim-title"),
        titleText: $t("email.claim-title"),
        itemName,
        itemImageUrl,
        listName: listDisplayName,
        listUrl,
        listLinkText: $t("email.claim-view-list", { values: { listName: listDisplayName } }),
        bodyText: $t("email.claim-body"),
        buttonText: $t("email.claim-button"),
        footerText: $t("email.claim-footer")
    });
    return await sendEmail({
        to,
        subject: $t("email.claim-subject"),
        html,
        text: $t("email.claim-fallback-text", {
            values: { url: manageUrl, itemName, listName: listDisplayName, listUrl }
        })
    });
};

export const sendTest = async (to: string) => {
    const $t = await getFormatter();
    return await sendEmail({
        to,
        subject: $t("email.test-subject"),
        text: $t("email.test-body")
    });
};
