import lucia from "lucia-auth";
import prisma from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import { client } from "./prisma";
import { sveltekit } from "lucia-auth/middleware";

export const auth = lucia({
	adapter: prisma(client),
	middleware: sveltekit(),
	env: dev ? "DEV" : "PROD",
	transformDatabaseUser: (databaseUser) => {
		return {
			userId: databaseUser.id,
			username: databaseUser.username,
			email: databaseUser.email,
			name: databaseUser.name,
			roleId: databaseUser.roleId,
			picture: databaseUser.picture
		};
	}
});

export type Auth = typeof auth;
