import { error } from "@sveltejs/kit";
import { Impit, type Browser } from "impit";
import metascraper, { type Metadata } from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import ecommerce from "@cmintey/metascraper-ecommerce";
import { getFormatter } from "$lib/server/i18n";
import { logger } from "$lib/server/logger";
import { env } from "$env/dynamic/private";
import { getSafeUrl } from "$lib/server/safeurl";
import { randomInt } from "crypto";

const scraper = metascraper([ecommerce(), metascraperTitle(), metascraperImage()]);

const determineProxy = (url: URL) => {
    if (url.protocol === "http:") {
        return env.http_proxy || env.HTTP_PROXY;
    } else if (url.protocol === "https:") {
        return env.https_proxy || env.HTTPS_PROXY;
    }
};

const getRandomBrowser = () => {
    const browsers: Browser[] = [
        "chrome131",
        "chrome136",
        "chrome142",
        "chrome151",
        "firefox135",
        "firefox144",
        "ios18"
    ];
    const i = randomInt(browsers.length);
    return browsers[i];
};

const getProductHTML = async (impit: Impit, targetUrl: URL) => {
    let redirectNum = 0;
    let url: URL = targetUrl;
    while (redirectNum < 10) {
        const resp = await impit.fetch(url);
        if (resp.status >= 300 && resp.status < 400 && resp.headers.get("location")) {
            const nextUrl = await getSafeUrl(resp.headers.get("location"));
            if (!nextUrl) {
                logger.error("URL resolved to a private access - blocking the request.");
                break;
            }
            url = nextUrl;
            redirectNum++;
            continue;
        }

        return {
            url: url.toString(),
            html: await resp.text()
        };
    }

    logger.error("Unable to fetch product after 10 redirects");
    return {
        url: targetUrl.toString(),
        html: ""
    };
};

const goShopping = async (targetUrl: URL, acceptLanguage: string | null) => {
    const impit = new Impit({
        browser: getRandomBrowser(),
        vanillaFallback: true,
        proxyUrl: determineProxy(targetUrl),
        headers: {
            "Accept-Language": acceptLanguage || "en-US,en;q=0.9"
        },
        followRedirects: false
    });

    const page = await getProductHTML(impit, targetUrl);
    const metadata = await scraper(page);
    logger.debug(
        {
            url: targetUrl.toString(),
            resolvedUrl: page.url,
            bodyLength: page.html.length,
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

export const fetchProduct = async (url: string, acceptLanguage: string | null) => {
    const $t = await getFormatter();

    const targetUrl = await getUrlOrError(url);

    let metadata = await goShopping(targetUrl, acceptLanguage);
    if (isCaptchaResponse(metadata) && metadata.url && metadata.url !== targetUrl.toString()) {
        // retry with the resolved URL
        metadata = await getUrlOrError(metadata.url).then((url) => goShopping(url, acceptLanguage));
    }
    if (isCaptchaResponse(metadata) || !hasUsableMetadata(metadata)) {
        error(424, $t("errors.product-information-not-available"));
    }

    if (metadata.url == metadata.image) {
        metadata.url = targetUrl.toString();
    }

    return new Response(JSON.stringify(metadata));
};
