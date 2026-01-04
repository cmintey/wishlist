import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { gotScraping } from "got-scraping";
import metascraper, { type Metadata } from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import shopping from "$lib/server/shopping";
import { parseAcceptLanguageHeader } from "$lib/i18n";
import { getFormatter } from "$lib/server/i18n";
import { requireLoginOrError } from "$lib/server/auth";
import { env } from "$env/dynamic/private";

const scraper = metascraper([shopping(), metascraperTitle(), metascraperImage()]);

const determineProxy = (url: URL) => {
    if (url.protocol === "http:") {
        return env.http_proxy || env.HTTP_PROXY;
    } else if (url.protocol === "https:") {
        return env.https_proxy || env.HTTPS_PROXY;
    }
};

const goShopping = async (targetUrl: URL, locales: string[]) => {
    const resp = await gotScraping({
        url: targetUrl,
        proxyUrl: determineProxy(targetUrl),
        headerGeneratorOptions: {
            devices: ["desktop"],
            locales
        }
    });
    console.log(resp.body);

    const metadata = await scraper({ html: resp.body, url: resp.url });
    return metadata;
};

const isCaptchaResponse = (metadata: Metadata) => {
    return metadata.image && metadata.image.toLocaleLowerCase().indexOf("captcha") >= 0;
};

const getUrlOrError = async (url: string) => {
    const $t = await getFormatter();

    try {
        return new URL(url);
    } catch {
        error(400, $t("errors.valid-url-not-provided"));
    }
};

export const POST: RequestHandler = async ({ request }) => {
    await requireLoginOrError();
    const $t = await getFormatter();
    const requestJson = await request.json();
    const url = requestJson.url as string | undefined;
    const html = requestJson.html as string | undefined;

    const acceptLanguage = request.headers?.get("accept-language");
    const locales = parseAcceptLanguageHeader(acceptLanguage);

    if (url) {
        const targetUrl = await getUrlOrError(url);
        let metadata = await goShopping(targetUrl, locales);
        if (isCaptchaResponse(metadata) && metadata.url) {
            // retry with the resolved URL
            metadata = await getUrlOrError(metadata.url).then((url) => goShopping(url, locales));
        }
        if (isCaptchaResponse(metadata)) {
            error(424, $t("errors.product-information-not-available"));
        }

        if (metadata.url == metadata.image) {
            metadata.url = targetUrl.toString();
        }

        return new Response(JSON.stringify(metadata));
    }

    if (html) {
        const metadata = await scraper({ html, url: url || "https://github.com/cmintey/wishlist" });
        return new Response(JSON.stringify(metadata));
    }

    return error(422, "Must specify html or url in body");
};
