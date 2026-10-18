import { error } from "@sveltejs/kit";
import { gotScraping } from "got-scraping";
import metascraper, { type Metadata } from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import ecommerce from "@cmintey/metascraper-ecommerce";
import { getFormatter } from "$lib/server/i18n";
import { logger } from "$lib/server/logger";
import { env } from "$env/dynamic/private";
import { getSafeUrl } from "$lib/server/safeurl";

const scraper = metascraper([ecommerce(), metascraperTitle(), metascraperImage()]);

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
        {
            url: targetUrl.toString(),
            resolvedUrl: resp.url,
            status: resp.statusCode,
            bodyLength: resp.body?.length,
            metadata
        },
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

export const fetchProduct = async (url: string, locales: string[]) => {
    const $t = await getFormatter();

    const targetUrl = await getUrlOrError(url);

    let metadata = await goShopping(targetUrl, locales);
    if (isCaptchaResponse(metadata) && metadata.url && metadata.url !== targetUrl.toString()) {
        // retry with the resolved URL
        metadata = await getUrlOrError(metadata.url).then((url) => goShopping(url, locales));
    }
    if (isCaptchaResponse(metadata) || !hasUsableMetadata(metadata)) {
        error(424, $t("errors.product-information-not-available"));
    }

    if (metadata.url == metadata.image) {
        metadata.url = targetUrl.toString();
    }

    return new Response(JSON.stringify(metadata));
};
