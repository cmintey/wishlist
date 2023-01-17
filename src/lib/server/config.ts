import { env } from "$env/dynamic/private";
import { readFileSync, writeFileSync } from "fs";

const configFile = "config/config.json";

const getConfig = (): Config => {
	console.log("loading config");
	let config;
	try {
		config = JSON.parse(readFileSync(configFile, { encoding: "utf-8" }));
	} catch {
		config = createDefaultConfig();
	}

	return config;
};

const createDefaultConfig = (): Config => {
	console.log("No config file found, creating default");
	const config: Config = {
		enableSignup: Boolean(env.ENABLE_SIGNUP),
		suggestions: {
			enable: Boolean(env.ALLOW_SUGGESTIONS),
			method: (env.SUGGESTION_METHOD as SuggestionMethod) || "approval"
		},
		smtp: {
			enable: false,
			host: env.SMTP_HOST,
			port: Number.parseInt(env.SMTP_PORT),
			user: env.SMTP_USER,
			pass: env.SMTP_PASS,
			from: env.SMTP_FROM,
			fromName: env.SMTP_FROM_NAME
		}
	};

	writeFileSync(configFile, JSON.stringify(config), { encoding: "utf-8" });

	return config;
};

export const config = getConfig();
export default config;
