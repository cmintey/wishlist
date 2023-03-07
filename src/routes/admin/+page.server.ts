/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Role } from "$lib/schema";
import { writeConfig, getConfig } from "$lib/server/config";
import { sendSignupLink, sendTest } from "$lib/server/email";
import { client } from "$lib/server/prisma";
import generateToken, { hashToken } from "$lib/server/token";
import { settingSchema } from "$lib/validations/settings";
import { error, fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/admin`);
	}
	if (user.roleId !== Role.ADMIN) {
		throw error(401, "Not authorized to view admin panel");
	}

	const users = await client.user.findMany({
		select: {
			username: true,
			name: true,
			email: true,
			role: {
				select: {
					id: true
				}
			}
		}
	});

	const config = await getConfig();

	return {
		user: {
			isAdmin: true,
			...user
		},
		users: users.map((user) => ({
			isAdmin: user.role.id === Role.ADMIN,
			...user
		})),
		config
	};
};

const generateConfig = (configData: z.infer<typeof settingSchema>) => {
	const smtpConfig: SMTPConfig = configData.enableSMTP
		? {
				enable: true,
				host: configData.smtpHost!,
				port: configData.smtpPort!,
				user: configData.smtpUser!,
				pass: configData.smtpPass!,
				from: configData.smtpFrom!,
				fromName: configData.smtpFromName!
		  }
		: {
				enable: false,
				host: configData.smtpHost,
				port: configData.smtpPort,
				user: configData.smtpUser,
				pass: configData.smtpPass,
				from: configData.smtpFrom,
				fromName: configData.smtpFromName
		  };

	const newConfig: Config = {
		enableSignup: configData.enableSignup,
		suggestions: {
			enable: configData.enableSuggestions,
			method: configData.suggestionMethod
		},
		smtp: smtpConfig
	};

	return newConfig;
};

export const actions: Actions = {
	"invite-user": async ({ url, request }) => {
		const token = await generateToken();
		const tokenUrl = new URL(`/signup?token=${token}`, url);

		const config = await getConfig();

		if (!config.smtp.enable) {
			await client.signupToken.create({
				data: {
					hashedToken: hashToken(token),
					expiresIn: 21600000 // 6 hours in milliseconds
				}
			});

			return { action: "invite-email", success: true, url: tokenUrl.href };
		}

		const formData = Object.fromEntries(await request.formData());
		const schema = z.object({
			"invite-email": z.string().email()
		});

		const emailData = schema.safeParse(formData);

		if (!emailData.success) {
			const errors = emailData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { action: "invite-email", error: true, errors });
		}

		await client.signupToken.create({
			data: {
				hashedToken: hashToken(token),
				expiresIn: 21600000 // 6 hours in milliseconds
			}
		});

		await sendSignupLink(emailData.data["invite-email"], tokenUrl.href);
		return { action: "invite-email", success: true, url: null };
	},
	"send-test": async ({ locals }) => {
		const { user } = await locals.validateUser();
		if (!user) return fail(400);
		await sendTest(user?.email);
		return { action: "send-test", success: true };
	},
	settings: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		const configData = settingSchema.safeParse(formData);

		if (!configData.success) {
			const errors = configData.error.errors.map((error) => {
				return {
					field: error.path[0],
					message: error.message
				};
			});
			return fail(400, { action: "settings", error: true, errors });
		}

		const newConfig = generateConfig(configData.data);
		await writeConfig(newConfig);

		return { action: "settings", success: true };
	}
};
