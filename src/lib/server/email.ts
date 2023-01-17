import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import { readFile } from "fs";

import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type Mail from "nodemailer/lib/mailer";
import config from "$lib/server/config";

type TemplateData = {
	url: string;
};

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

if (config.smtp.enable) {
	transport = nodemailer.createTransport({
		port: config.smtp.port,
		host: config.smtp.host,
		auth: {
			user: config.smtp.user,
			pass: config.smtp.pass
		}
	});
}

const sendEmail = async (options: Mail.Options) => {
	if (!config.smtp.enable || !transport) {
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
			//@ts-expect-error checked in sendEmail function
			name: config.smtp.fromName,
			//@ts-expect-error checked in sendEmail function
			address: config.smtp.from
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
			//@ts-expect-error checked in sendEmail function
			name: config.smtp.fromName,
			//@ts-expect-error checked in sendEmail function
			address: config.smtp.from
		},
		to,
		subject: "Password Reset",
		html,
		text: `Follow the link to reset your password ${url}`
	});
};
