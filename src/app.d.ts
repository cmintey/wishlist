declare global {
	/// <reference types="lucia-auth" />
	declare namespace Lucia {
		type Auth = import("$lib/server/auth").Auth;
		type UserAttributes = {
			username: string;
			name: string;
			email: string;
			roleId: number;
		};
	}

	// See https://kit.svelte.dev/docs/types#app
	// for information about these interfaces
	// and what to do when importing types
	/// <reference types="@sveltejs/kit" />
	declare namespace App {
		interface Locals {
			validate: import("@lucia-auth/sveltekit").Validate;
			validateUser: import("@lucia-auth/sveltekit").ValidateUser;
			setSession: import("@lucia-auth/sveltekit").SetSession;
		}
	}
}

export {};
