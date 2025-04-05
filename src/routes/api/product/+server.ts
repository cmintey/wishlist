import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { gotScraping } from "got-scraping";
import metascraper, { type Metadata } from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import metascraperUrl from "metascraper-url";
import metascraperAmazon from "metascraper-amazon";
import shopping from "$lib/server/shopping";
import { getFormatter, parseAcceptLanguageHeader } from "$lib/i18n";
import { requireLoginOrError } from "$lib/server/auth";

const scraper = metascraper([
    metascraperAmazon(),
    shopping(),
    metascraperTitle(),
    metascraperImage(),
    metascraperUrl()
]);

const goShopping = async (targetUrl: string, locales: string[]) => {
    const resp = await gotScraping({
        url: targetUrl,
        headerGeneratorOptions: {
            devices: ["desktop"],
            locales
        }
    });
    const metadata = await scraper({ html: resp.body, url: resp.url });
    return metadata;
};

const isCaptchaResponse = (metadata: Metadata) => {
    return metadata.image && metadata.image.toLocaleLowerCase().indexOf("captcha") >= 0;
};

export const GET: RequestHandler = async ({ request }) => {
    await requireLoginOrError();
    const $t = await getFormatter();
    const url = new URL(request.url).searchParams.get("url");
    const acceptLanguage = request.headers?.get("accept-language");
    const locales = parseAcceptLanguageHeader(acceptLanguage);
    let isUrlValid = false;

    if (url) {
        try {
            isUrlValid = Boolean(new URL(url));
        } catch {
            isUrlValid = false;
        }
        if (!isUrlValid) error(400, $t("errors.valid-url-not-provided"));

        let metadata = await goShopping(url, locales);
        if (isCaptchaResponse(metadata) && metadata.url) {
            // retry with the resolved URL
            metadata = await goShopping(metadata.url, locales);
        }
        if (isCaptchaResponse(metadata)) {
            error(424, $t("errors.product-information-not-available"));
        }

        if (metadata.url == metadata.image) {
            metadata.url = url;
        }

        return new Response(JSON.stringify(metadata));
    } else {
        error(400, $t("errors.must-specify-url-in-query-parameters"));
    }
};
