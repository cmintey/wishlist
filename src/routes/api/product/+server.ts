import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { gotScraping } from "got-scraping";
import metascraper, { type Metadata } from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import metascraperUrl from "metascraper-url";
import metascraperAmazon from "metascraper-amazon";
import shopping from "$lib/server/shopping";

const scraper = metascraper([
	metascraperAmazon(),
	shopping(),
	metascraperTitle(),
	metascraperImage(),
	metascraperUrl()
]);

const goShopping = async (targetUrl: string) => {
	const { body: html, url } = await gotScraping(targetUrl);
	const metadata = await scraper({ html, url });
	return metadata;
};

const isCaptchaResponse = (metadata: Metadata) => {
	return metadata.image.toLocaleLowerCase().indexOf("captcha") >= 0;
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

		let metadata = await goShopping(url);
		if (isCaptchaResponse(metadata)) {
			// retry with the resolved URL
			metadata = await goShopping(metadata.url);
		}

		return new Response(JSON.stringify(metadata));
	} else {
		throw error(400, "must specify url in query parameters");
	}
};
