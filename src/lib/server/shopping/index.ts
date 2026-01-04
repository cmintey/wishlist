/* eslint @typescript-eslint/ban-ts-comment: 0 */
//@ts-nocheck
import type { CheckOptions, Rules } from "metascraper";
import { toPriceFormat, getHostname } from "./helpers";
import pkg from "@metascraper/helpers";
const { memoizeOne, $jsonld, toRule, title, $filter } = pkg;

const jsonLd = memoizeOne(($: CheckOptions["htmlDom"]) => {
    const jsonld = JSON.parse($('script[type="application/ld+json"]').html());
    return jsonld;
});

const jsonLdGraph = memoizeOne(($: CheckOptions["htmlDom"]) => {
    const jsonld = JSON.parse($('script[type="application/ld+json"]').html());
    return jsonld && jsonld["@graph"];
});

const jsonLdGraphProduct = memoizeOne(($: CheckOptions["htmlDom"]) => {
    const jsonld = jsonLdGraph($);

    if (jsonld) {
        const products = jsonld.filter((i) => {
            return i["@type"] === "Product";
        });
        return products.length > 0 ? products[0] : null;
    }
    return;
});

const jsonLdLastBreadcrumb = memoizeOne(($: CheckOptions["htmlDom"]) => {
    const jsonld = jsonLdGraph($);
    if (jsonld) {
        const breadcrumbs = jsonld.filter((i) => {
            return i["@type"] === "BreadcrumbList";
        });
        const breadcrumb = breadcrumbs.length > 0 && breadcrumbs[0];
        const items = breadcrumb.itemListElement;
        if (items && items.length > 0) {
            return items[items.length - 1];
        }
    }

    return null;
});

const toTitle = toRule(title, { removeSeparator: false });

/**
 * A set of rules we want to declare under the `metascraper-shopping` namespace.
 *
 **/
export default () => {
    const rules: Rules = {
        pkgName: "metascraper-shopping",
        brand: [
            ({ htmlDom: $ }) => {
                const jsonld = jsonLd($);
                let brand = jsonld && jsonld.brand;
                if (brand && brand.name) {
                    brand = brand.name;
                }
                return brand;
            }
        ],
        name: [
            ({ htmlDom: $ }) => {
                const jsonld = jsonLd($);

                return jsonld && jsonld.name;
            },
            ({ htmlDom: $ }) => {
                const jsonld = jsonLdLastBreadcrumb($);
                return jsonld && jsonld.name;
            },
            ({ htmlDom: $ }) => {
                const jsonld = jsonLdGraphProduct($);
                return jsonld && jsonld.name;
            },
            ({ htmlDom: $ }) => $('[property="og:title"]').attr("content")
        ],
        title: [
            toTitle(($) => $filter($, $("#productTitle"))),
            toTitle(($) => $filter($, $("#btAsinTitle"))),
            toTitle(($) => $filter($, $("h1.a-size-large"))),
            toTitle(($) => $filter($, $("#item_name")))
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
                let image = jsonld && jsonld.image;

                if (image && image["@type"] === "ImageObject") {
                    image = image.image;
                }

                if (Array.isArray(image)) {
                    image = image[0];
                }

                if (image) return image;
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
                return jsonld && jsonld.offers && jsonld.offers.priceCurrency;
            },
            ({ htmlDom: $ }) => $('[property="og:price:currency"]').attr("content"),
            ({ htmlDom: $, url }) => $jsonld("offers.0.priceCurrency")($, url),
            ({ htmlDom: $, url }) => $jsonld("offers.priceCurrency")($, url),
            ({ htmlDom: $, url }) => $jsonld("hasVariant.0.offers.0.priceCurrency")($, url),
            ({ htmlDom: $, url }) => $jsonld("hasVariant.0.offers.priceCurrency")($, url),
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
                return jsonld && jsonld.sku;
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
                return jsonld && jsonld.offers && jsonld.offers.availability;
            },
            ({ htmlDom: $ }) => $('[property="og:availability"]').attr("content"),
            ({ htmlDom: $, url }) => $jsonld("offers.availability")($, url),
            ({ htmlDom: $, url }) => $jsonld("offers.0.availability")($, url),
            ({ htmlDom: $ }) => $("[itemprop=availability]").attr("href")
        ],
        price: [
            ({ htmlDom: $ }) => {
                const jsonld = jsonLdGraphProduct($);
                return jsonld && jsonld.offers && toPriceFormat(jsonld.offers.price);
            },
            ({ htmlDom: $ }) => toPriceFormat($('[property="og:price:amount"]').attr("content")),
            ({ htmlDom: $ }) => toPriceFormat($("[itemprop=price]").attr("content")),
            ({ htmlDom: $ }) => toPriceFormat($('[property="product:price:amount"]').attr("content")),
            ({ htmlDom: $, url }) => toPriceFormat($jsonld("price")($, url)),
            ({ htmlDom: $, url }) => toPriceFormat($jsonld("offers.price")($, url)),
            ({ htmlDom: $, url }) => toPriceFormat($jsonld("offers.0.price")($, url)),
            ({ htmlDom: $, url }) => toPriceFormat($jsonld("0.offers.price")($, url)),
            ({ htmlDom: $, url }) => toPriceFormat($jsonld("offers.lowPrice")($, url)),
            ({ htmlDom: $, url }) => toPriceFormat($jsonld("offers.0.lowPrice")($, url)),
            ({ htmlDom: $, url }) => toPriceFormat($jsonld("offers.highPrice")($, url)),
            ({ htmlDom: $, url }) => toPriceFormat($jsonld("offers.0.highPrice")($, url)),
            ({ htmlDom: $, url }) => toPriceFormat($jsonld("hasVariant.0.offers.0.price")($, url)),
            ({ htmlDom: $, url }) => toPriceFormat($jsonld("hasVariant.0.offers.price")($, url)),
            ({ htmlDom: $ }) => toPriceFormat($("[data-asin-price]").attr("data-asin-price")), //amazon
            ({ htmlDom: $ }) => toPriceFormat($("[itemprop=price]").html()),
            ({ htmlDom: $ }) => toPriceFormat($("#attach-base-product-price").attr("value")),
            ({ htmlDom: $ }) => toPriceFormat($("span.a-offscreen", "span.a-price").html()),
            ({ htmlDom: $ }) => toPriceFormat($("span.price-amount").html())
        ],
        asin: [
            //unique amazon identifier
            ({ htmlDom: $ }) => $("[data-asin]").attr("data-asin")
        ],
        hostname: [({ url }) => getHostname(url)],
        retailer: [({ htmlDom: $ }) => $('[property="og:site_name"]').attr("content")]
    };
    return rules;
};
