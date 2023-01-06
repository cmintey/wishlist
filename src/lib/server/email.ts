import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { readFile } from "fs";
import { env } from "$env/dynamic/private";

import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type Mail from "nodemailer/lib/mailer";

type TemplateData = {
	url: string;
};

export const SMTP_ENABLED =
	env?.SMTP_HOST != "" &&
	env?.SMTP_PORT != "" &&
	env?.SMTP_USER != "" &&
	env?.SMTP_PASS != "" &&
	env?.SMTP_FROM != "" &&
	env?.SMTP_FROM_NAME != "";

let transport: Transporter<SMTPTransport.SentMessageInfo> | null = null;
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

if (SMTP_ENABLED) {
	transport = nodemailer.createTransport({
		port: Number.parseInt(env.SMTP_PORT),
		host: env.SMTP_HOST,
		auth: {
			user: env.SMTP_USER,
			pass: env.SMTP_PASS
		}
	});
}

const sendEmail = async (options: Mail.Options) => {
	if (!transport) {
		console.log("SMTP not set up properly, check your settings");
		return false;
	}

	const msgInfo = await transport.sendMail(options);

	console.log(msgInfo);
	return msgInfo.accepted.length > 0;
};

export const sendSignupLink = async (to: string, url: string) => {
	const html = inviteTempl({ url });
	return await sendEmail({
		from: {
			name: env.SMTP_FROM_NAME,
			address: env.SMTP_FROM
		},
		to,
		subject: "Wishlist Invite",
		html,
		text: `Somebody has invited you to join their Wishlist! Follow the link to signup: ${url}`
	});
};

export const sendPasswordReset = async (to: string, url: string) => {
	const html = passResetTempl({ url });
	return await sendEmail({
		from: {
			name: env.SMTP_FROM_NAME,
			address: env.SMTP_FROM
		},
		to,
		subject: "Password Reset",
		html,
		text: `Follow the link to reset your password ${url}`
	});
};
