declare global {
	/// <reference types="lucia" />
	declare namespace Lucia {
		type Auth = import("$lib/server/auth").Auth;
		type DatabaseUserAttributes = {
			username: string;
			name: string;
			email: string;
			roleId: number;
			picture?: string | null;
		};
		// eslint-disable-next-line @typescript-eslint/ban-types
		type DatabaseSessionAttributes = {};
	}

	// See https://kit.svelte.dev/docs/types#app
	// for information about these interfaces
	// and what to do when importing types
	/// <reference types="@sveltejs/kit" />
	declare namespace App {
		type AuthRequest = import("lucia").AuthRequest;
		// Locals must be an interface and not a type
		// eslint-disable-next-line @typescript-eslint/no-empty-interface
		interface Locals extends AuthRequest {}
	}
}

export {};
