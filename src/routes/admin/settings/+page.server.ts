/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Role } from "$lib/schema";
import { getConfig, writeConfig } from "$lib/server/config";
import { redirect, error, fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { sendTest } from "$lib/server/email";
import { settingSchema } from "$lib/validations/settings";
import type { z } from "zod";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.validateUser();
	if (!session) {
		throw redirect(302, `/login?ref=/admin`);
	}
	if (user.roleId !== Role.ADMIN) {
		throw error(401, "Not authorized to view admin panel");
	}

	const config = getConfig();

	return {
		config
	};
};

export const actions: Actions = {
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
