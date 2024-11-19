import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { readFile } from "fs";
import type Mail from "nodemailer/lib/mailer";
import { getConfig } from "$lib/server/config";
import { env } from "$env/dynamic/private";

type TemplateData = {
    url: string;
    baseUrl: string;
};

let passResetTempl: HandlebarsTemplateDelegate<TemplateData>;
let inviteTempl: HandlebarsTemplateDelegate<TemplateData>;

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

export const sendSignupLink = async (to: string, url: string) => {
    const html = inviteTempl({ url, baseUrl: env.ORIGIN || "http://localhost:5173" });
    return await sendEmail({
        to,
        subject: "Wishlist Invite",
        html,
        text: `Somebody has invited you to join their Wishlist! Follow the link to signup: ${url}`
    });
};

export const sendPasswordReset = async (to: string, url: string) => {
    const html = passResetTempl({ url, baseUrl: env.ORIGIN || "http://localhost:5173" });
    return await sendEmail({
        to,
        subject: "Password Reset",
        html,
        text: `Follow the link to reset your password ${url}`
    });
};

export const sendTest = async (to: string) => {
    return await sendEmail({
        to,
        subject: "Test from Wishlist",
        text: "If you're reading this, then congratulations! Email configuration seems to have been set up properly!"
    });
};
