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
import { logger } from "$lib/server/logger";
import { env } from "$env/dynamic/private";
import { getSafeUrl } from "$lib/server/safeurl";

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
        },
        hooks: {
            beforeRedirect: [
                async (options) => {
                    if (options.url) {
                        const safeUrl = await getSafeUrl(options.url);
                        if (safeUrl === null) {
                            throw new Error("The resolved IP of the domain is reserved");
                        }
                        options.url = safeUrl;
                    }
                }
            ]
        }
    });
    const metadata = await scraper({ html: resp.body, url: resp.url });
    logger.debug(
        { url: targetUrl.toString(), resolvedUrl: resp.url, status: resp.statusCode, bodyLength: resp.body?.length },
        "Scraped product URL"
    );
    return metadata;
};

const isCaptchaResponse = (metadata: Metadata) => {
    return metadata.image && metadata.image.toLocaleLowerCase().indexOf("captcha") >= 0;
};

const hasUsableMetadata = (metadata: Metadata) => {
    const { name, title, image } = metadata as Metadata & { name?: string | null };
    return Boolean(name || title || image);
};

const getUrlOrError = async (url: string) => {
    const $t = await getFormatter();
    const safeUrl = await getSafeUrl(url);
    if (safeUrl === null) {
        error(400, $t("errors.valid-url-not-provided"));
    }
    return safeUrl;
};

export const GET: RequestHandler = async ({ request, url }) => {
    await requireLoginOrError();
    const $t = await getFormatter();
    const encodedUrl = url.searchParams.get("url");
    const acceptLanguage = request.headers?.get("accept-language");
    const locales = parseAcceptLanguageHeader(acceptLanguage);

    if (encodedUrl) {
        const targetUrl = await getUrlOrError(decodeURI(encodedUrl));

        let metadata = await goShopping(targetUrl, locales);
        if (isCaptchaResponse(metadata) && metadata.url) {
            // retry with the resolved URL
            metadata = await getUrlOrError(metadata.url).then((url) => goShopping(url, locales));
        }
        if (isCaptchaResponse(metadata)) {
            error(424, $t("errors.product-information-not-available"));
        }

        if (!hasUsableMetadata(metadata)) {
            error(424, $t("errors.product-information-not-available"));
        }

        if (metadata.url == metadata.image) {
            metadata.url = targetUrl.toString();
        }

        return new Response(JSON.stringify(metadata));
    } else {
        error(400, $t("errors.must-specify-url-in-query-parameters"));
    }
};
