import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import metascraper from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import metascraperUrl from "metascraper-url";
import metascraperAmazon from "metascraper-amazon";
import metascraperShopping from "@samirrayani/metascraper-shopping";
import shopping from "$lib/server/shopping";

const scraper = metascraper([
	metascraperAmazon(),
	metascraperShopping(),
	shopping(),
	metascraperTitle(),
	metascraperImage(),
	metascraperUrl()
]);

const goShopping = async (targetUrl: string) => {
	const res = await fetch(targetUrl);
	const html = await res.text();
	const metadata = await scraper({ html, url: res.url });
	return metadata;
};

export const GET: RequestHandler = async ({ request }) => {
	const url = new URL(request.url).searchParams.get("url");
	let isUrlValid = false;

	if (url) {
		try {
			isUrlValid = Boolean(new URL(url));
		} catch {
			isUrlValid = false;
		}
		if (!isUrlValid) throw error(400, "valid url not provided");

		const metadata = await goShopping(url);
		return new Response(JSON.stringify(metadata));
	} else {
		throw error(400, "must specify url in query parameters");
	}
};
