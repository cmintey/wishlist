import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { readFile } from "fs";
import type Mail from "nodemailer/lib/mailer";
import { getConfig } from "$lib/server/config";
import { env } from "$env/dynamic/private";
import { getFormatter } from "$lib/server/i18n";

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

let passResetTempl: HandlebarsTemplateDelegate<PasswordResetTemplateData>;
let inviteTempl: HandlebarsTemplateDelegate<InviteTemplateData>;

readFile("templates/password-reset.html", "utf-8", (err, data) => {
    if (err) {
        console.log("error reading password reset template");
    } else {
        passResetTempl = Handlebars.compile(data);
    }
});

readFile("templates/invite.html", "utf-8", (err, data) => {
    if (err) {
        console.log("error reading invite template");
    } else {
        inviteTempl = Handlebars.compile(data);
    }
});

const sendEmail = async (options: Mail.Options) => {
    const config = await getConfig(undefined, true);

    if (
        !config.smtp.enable ||
        (config.smtp.enable &&
            !config.smtp.host &&
            !config.smtp.port &&
            !config.smtp.user &&
            !config.smtp.pass &&
            !config.smtp.from &&
            !config.smtp.fromName)
    ) {
        console.log("SMTP not set up properly, check your settings");
        return {
            success: false,
            message: "SMTP not set up properly, check your settings"
        };
    }

    const transport = nodemailer.createTransport({
        port: config.smtp.port,
        host: config.smtp.host,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass
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
            console.error(e);
            return {
                success: false,
                message: e?.response
            };
        });
};

export const sendSignupLink = async (to: string, inviteUrl: string) => {
    const $t = await getFormatter();
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

export const sendTest = async (to: string) => {
    const $t = await getFormatter();
    return await sendEmail({
        to,
        subject: $t("email.test-subject"),
        text: $t("email.test-body")
    });
};
