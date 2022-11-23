// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
/// <reference types="lucia-auth" />
declare namespace Lucia {
	type Auth = import("$lib/server/auth").Auth;
	type UserAttributes = {
		username: string;
	};
}

/// <reference types="@sveltejs/kit" />
declare namespace App {
	interface Locals {
		getSession: import("@lucia-auth/sveltekit").GetSession;
		getSessionUser: import("@lucia-auth/sveltekit").GetSessionUser;
		setSession: import("@lucia-auth/sveltekit").SetSession;
	}
}

type ProductData = {
	brand: string | null;
	name: string | null;
	url: string | null;
	image: string | null;
	currency: string | null;
	condition: string | null;
	sku: string | null;
	mpn: string | null;
	availability: string | null;
	price: number | null;
	asin: string | null;
	hostname: string | null;
	retailer: string | null;
	title: string | null;
};
