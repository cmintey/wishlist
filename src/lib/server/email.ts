import nodemailer from "nodemailer";
import { env } from "$env/dynamic/private";

import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type Mail from "nodemailer/lib/mailer";

export const SMTP_ENABLED =
	env?.SMTP_HOST != "" &&
	env?.SMTP_PORT != "" &&
	env?.SMTP_USER != "" &&
	env?.SMTP_PASS != "" &&
	env?.SMTP_FROM != "";

let transport: Transporter<SMTPTransport.SentMessageInfo> | null = null;

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
	return await sendEmail({
		from: env.SMTP_FROM,
		to,
		subject: "Wishlist Invite",
		html: `Somebody has invited you to join their Wishlist! Follow the link to signup: <a href=${url}>${url}</a>`
	});
};

export const sendPasswordReset = async (to: string, url: string) => {
	return await sendEmail({
		from: env.SMTP_FROM,
		to,
		subject: "Password Reset",
		html: `Follow the link to reset your password <a href=${url}>${url}</a>`
	});
};
