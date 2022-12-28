import nodemailer from "nodemailer";
import { env } from "$env/dynamic/private";

import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export const SMTP_ENABLED =
	env?.SMTP_HOST != "" &&
	env?.SMTP_PORT != "" &&
	env?.SMTP_USER != "" &&
	env?.SMTP_PASS != "" &&
	env?.SMTP_FROM != "";

let transport: Transporter<SMTPTransport.SentMessageInfo> | null = null;

if (SMTP_ENABLED) {
	transport = nodemailer.createTransport({
		port: Number.parseInt(env.SMTP_PORT!),
		host: env.SMTP_HOST,
		auth: {
			user: env.SMTP_USER,
			pass: env.SMTP_PASS
		}
	});
}

export const sendPasswordReset = async (to: string, token: string) => {
	if (!transport) {
		console.log("SMTP not set up properly, check your settings");
		return false;
	}

	let msgInfo = await transport.sendMail({
		from: env.SMTP_FROM,
		to,
		subject: "Password Reset",
		text: `token ${token}`
	});

	console.log(msgInfo);
	return msgInfo.accepted.length > 0;
};
