import { lucia } from "lucia";
import { prisma } from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import { client } from "./prisma";
import { sveltekit } from "lucia/middleware";

export const auth = lucia({
	adapter: prisma(client),
	middleware: sveltekit(),
	env: dev ? "DEV" : "PROD",
	getUserAttributes: (data) => {
		return {
			username: data.username,
			email: data.email,
			name: data.name,
			roleId: data.roleId,
			picture: data.picture
		};
	}
});

export type Auth = typeof auth;
