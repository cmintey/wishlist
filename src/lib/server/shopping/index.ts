import type { Rules, RulesOptions, RulesTestOptions } from "metascraper";
import type { HtmlDomType } from "./helpers";
import {
    toPriceFormat,
    getHostname,
    jsonLd,
    jsonLdLastBreadcrumb,
    jsonLdGraphProduct,
    toTitle,
    type ShoppingMetadataRules,
    isRecord,
    getProperty
} from "./helpers";
import pkg from "@metascraper/helpers";
import domainRules from "./domains";

const { $jsonld, $filter } = pkg;

type ShoppingRuleSet = Rules & ShoppingMetadataRules;

/**
 * A set of rules we want to declare under the `metascraper-shopping` namespace.
 *
 **/
export default () => {
    // Base rules that apply to all domains.
    const rules: ShoppingRuleSet = {
        brand: [
            ({ htmlDom: $ }) => {
                const jsonld = jsonLd($);
                if (!jsonld) return;
                const brand = getProperty(jsonld, "brand");
                if (isRecord(brand) && "name" in brand && typeof brand.name === "string") {
                    return brand.name;
                }
                return typeof brand === "string" ? brand : undefined;
            }
        ],
        name: [
            ({ htmlDom: $ }) => {
                const jsonld = jsonLd($);
                const name = jsonld ? getProperty(jsonld, "name") : undefined;
                return typeof name === "string" ? name : undefined;
            },
            ({ htmlDom: $ }) => {
                const jsonld = jsonLdLastBreadcrumb($);
                const name = jsonld ? getProperty(jsonld, "name") : undefined;
                return typeof name === "string" ? name : undefined;
            },
            ({ htmlDom: $ }) => {
                const jsonld = jsonLdGraphProduct($);
                const name = jsonld ? getProperty(jsonld, "name") : undefined;
                return typeof name === "string" ? name : undefined;
            },
            ({ htmlDom: $ }) => $('[property="og:title"]').attr("content")
        ],
        title: [
            toTitle(($: HtmlDomType) => $filter($, $("#productTitle"))),
            toTitle(($: HtmlDomType) => $filter($, $("#btAsinTitle"))),
            toTitle(($: HtmlDomType) => $filter($, $("h1.a-size-large"))),
            toTitle(($: HtmlDomType) => $filter($, $("#item_name")))
        ],
        url: [
            ({ url }) => url // We'll trust the url the user provides as it may have additional product metadata
        ],
        image: [
            ({ htmlDom: $ }) => $("div#imgTagWrapperId img").attr("src"), //amazon.com
            ({ htmlDom: $ }) => $('[property="og:image:secure_url"]').attr("content"),
            ({ htmlDom: $, url }) => {
                let content = $('[property="og:image"]').attr("content");
                if (content && url.includes("rh.com")) {
                    content = content.replace("$GAL4$", "$np-fullwidth-lg$");
                }
                return content;
            },
            ({ htmlDom: $ }) => {
                const jsonld = jsonLd($);
                if (!jsonld) return;
                let image = getProperty(jsonld, "image");

                if (isRecord(image) && image["@type"] === "ImageObject") {
                    image = getProperty(image, "image");
                }

                if (Array.isArray(image) && image.length > 0) {
                    image = image[0];
                }

                return typeof image === "string" ? image : undefined;
            },
            ({ htmlDom: $ }) => $('meta.swiftype[name="image"]').attr("content"),
            ({ htmlDom: $, url }) => {
                const image = $('[property="og:image"]').attr("content");
                const protocol = new URL(url).protocol;

                try {
                    if (image) new URL(image); //catch if not a valid URL and assume it's because of protocol
                } catch {
                    if (image) return `${protocol}${image}`;
                }

                if (image) return image;
            }
        ],
        currency: [
            ({ htmlDom: $ }) => {
                const jsonld = jsonLdGraphProduct($);
                if (!jsonld) return;
                const offers = getProperty(jsonld, "offers");
                if (isRecord(offers)) {
                    const currency = getProperty(offers, "priceCurrency");
                    return typeof currency === "string" ? currency : undefined;
                }
                return undefined;
            },
            ({ htmlDom: $ }) => $('[property="og:price:currency"]').attr("content"),
            ({ htmlDom: $, url }) => $jsonld("offers.0.priceCurrency")($, url),
            ({ htmlDom: $, url }) => $jsonld("offers.priceCurrency")($, url),
            ({ htmlDom: $ }) => $("[data-asin-currency-code]").attr("data-asin-currency-code"), //amazon
            ({ htmlDom: $ }) => $('[property="product:price:currency"]').attr("content"),
            ({ htmlDom: $ }) => $("[itemprop=priceCurrency]").attr("content")
        ],
        condition: [
            ({ htmlDom: $, url }) => $jsonld("itemCondition")($, url),
            ({ htmlDom: $, url }) => $jsonld("offers.itemCondition")($, url),
            ({ htmlDom: $, url }) => $jsonld("offers.0.itemCondition")($, url)
        ],
        sku: [
            ({ htmlDom: $ }) => {
                const jsonld = jsonLdGraphProduct($);
                if (!jsonld) return;
                const sku = getProperty(jsonld, "sku");
                return typeof sku === "string" ? sku : undefined;
            },
            ({ htmlDom: $, url }) => $jsonld("sku")($, url),
            ({ htmlDom: $, url }) => $jsonld("offers.sku")($, url),
            ({ htmlDom: $, url }) => $jsonld("offers.0.sku")($, url),
            ({ htmlDom: $ }) => $("[itemprop=sku]").html()
        ],
        mpn: [
            //mpn=ManufacturProductNumber
            ({ htmlDom: $, url }) => $jsonld("mpn")($, url),
            ({ htmlDom: $, url }) => $jsonld("offers.mpn")($, url),
            ({ htmlDom: $, url }) => $jsonld("offers.0.mpn")($, url)
        ],
        availability: [
            ({ htmlDom: $ }) => {
                const jsonld = jsonLdGraphProduct($);
                if (!jsonld) return;
                const offers = getProperty(jsonld, "offers");
                if (isRecord(offers)) {
                    const availability = getProperty(offers, "availability");
                    return typeof availability === "string" ? availability : undefined;
                }
                return undefined;
            },
            ({ htmlDom: $ }) => $('[property="og:availability"]').attr("content"),
            ({ htmlDom: $, url }) => $jsonld("offers.availability")($, url),
            ({ htmlDom: $, url }) => $jsonld("offers.0.availability")($, url),
            ({ htmlDom: $ }) => $("[itemprop=availability]").attr("href")
        ],
        price: [
            ({ htmlDom: $ }) => {
                const jsonld = jsonLdGraphProduct($);
                if (!jsonld) return;
                const offers = getProperty(jsonld, "offers");
                if (isRecord(offers)) {
                    const price = getProperty(offers, "price");
                    const formatted = toPriceFormat(
                        typeof price === "string" || typeof price === "number" ? String(price) : undefined
                    );
                    return formatted !== undefined ? String(formatted) : undefined;
                }
                return undefined;
            },
            ({ htmlDom: $ }) => {
                const formatted = toPriceFormat($('[property="og:price:amount"]').attr("content"));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $ }) => {
                const formatted = toPriceFormat($("[itemprop=price]").attr("content"));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $ }) => {
                const formatted = toPriceFormat($('[property="product:price:amount"]').attr("content"));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $, url }) => {
                const formatted = toPriceFormat($jsonld("price")($, url));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $, url }) => {
                const formatted = toPriceFormat($jsonld("offers.price")($, url));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $, url }) => {
                const formatted = toPriceFormat($jsonld("offers.0.price")($, url));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $, url }) => {
                const formatted = toPriceFormat($jsonld("0.offers.price")($, url));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $, url }) => {
                const formatted = toPriceFormat($jsonld("offers.lowPrice")($, url));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $, url }) => {
                const formatted = toPriceFormat($jsonld("offers.0.lowPrice")($, url));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $, url }) => {
                const formatted = toPriceFormat($jsonld("offers.highPrice")($, url));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $, url }) => {
                const formatted = toPriceFormat($jsonld("offers.0.highPrice")($, url));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $ }) => {
                const formatted = toPriceFormat($("[data-asin-price]").attr("data-asin-price")); //amazon
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $ }) => {
                const formatted = toPriceFormat($("[itemprop=price]").html());
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $ }) => {
                const formatted = toPriceFormat($("#attach-base-product-price").attr("value"));
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $ }) => {
                const formatted = toPriceFormat($("span.a-offscreen", "span.a-price").html());
                return formatted !== undefined ? String(formatted) : undefined;
            },
            ({ htmlDom: $ }) => {
                const formatted = toPriceFormat($("span.price-amount").html());
                return formatted !== undefined ? String(formatted) : undefined;
            }
        ],
        asin: [
            //unique amazon identifier
            ({ htmlDom: $ }) => $("[data-asin]").attr("data-asin")
        ],
        hostname: [({ url }) => getHostname(url)],
        retailer: [({ htmlDom: $ }) => $('[property="og:site_name"]').attr("content")]
    };

    /**
     * Prepend any domain-specific rules so they are tried before the defaults.
     * Each domain rule is responsible for deciding whether it applies to the
     * current URL (e.g. using the `forDomains` helper). If it returns
     * `undefined`, metascraper will fall back to these base rules.
     */
    (Object.keys(domainRules) as Array<keyof ShoppingMetadataRules>).forEach((key) => {
        const domainChecks = domainRules[key];
        if (!domainChecks || domainChecks.length === 0) return;

        const baseChecks = (rules[key] ?? []) as RulesOptions[];
        // Type assertion is safe here because we've verified key is in ShoppingMetadataRules
        // and both domainChecks and baseChecks are RulesOptions[]
        (rules as ShoppingRuleSet & Record<keyof ShoppingMetadataRules, RulesOptions[]>)[key] = [
            ...domainChecks,
            ...baseChecks
        ];
    });

    rules.pkgName = "metascraper-shopping";
    return rules;
};
