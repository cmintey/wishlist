import type { ShoppingDomainRules, HtmlDomType } from "../helpers";
import { rulesForDomain } from "../helpers";
import {
    extractStringField,
    extractImage,
    extractPrice,
    extractCurrency,
    extractBrand,
    extractAvailability,
    extractFromVariant,
    extractFromJsonLd,
    extractSku
} from "../domain-helpers";

/**
 * Extract variant code from a bol.com URL.
 * URL pattern: https://www.bol.com/nl/nl/p/{product-name}/{variant-code}/...
 * Returns variant code (numeric string) or null if not found.
 */
const extractVariantCodeFromUrl = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/").filter((p) => p);
        // Look for a numeric variant code in path
        // Typically it's after the product name, so we look for a long numeric string
        for (const part of pathParts) {
            // Variant codes are typically long numeric strings (e.g., 9300000142746725)
            if (/^\d{10,}$/.test(part)) {
                return part;
            }
        }
    } catch {
        // Invalid URL
    }
    return null;
};

/**
 * Helper function to extract a field from bol.com variant-specific JSON-LD.
 * This encapsulates the common pattern used across all fields in bol.com parser.
 */
const extractBolField = (
    htmlDom: HtmlDomType,
    url: string,
    extractor: (data: unknown) => string | undefined,
    fallbackExtractor?: () => string | undefined
): string | undefined => {
    const variantCode = extractVariantCodeFromUrl(url);
    if (variantCode) {
        return extractFromVariant(
            htmlDom,
            (item) =>
                typeof item === "object" &&
                item !== null &&
                "@type" in item &&
                item["@type"] === "Product" &&
                "productID" in item &&
                item.productID === variantCode,
            extractor,
            fallbackExtractor || (() => extractFromJsonLd(htmlDom, "Product", extractor))
        );
    }
    // Fallback to first Product found
    return extractFromJsonLd(htmlDom, "Product", extractor);
};

/**
 * Custom parser for bol.com.
 *
 * bol.com exposes Product JSON-LD with product information.
 * The URL contains a variant code that we can use to match the correct product variant.
 * We extract the variant code from the URL and find the matching Product JSON-LD entry.
 * If anything fails, we return `undefined` so the base parser can take over.
 */
const domains = ["bol.com"];

export const bolComRules: ShoppingDomainRules = rulesForDomain(domains, {
    name: [
        ({ htmlDom, url }) => {
            return extractBolField(htmlDom, url, (data) => extractStringField(data, "name"));
        }
    ],
    image: [
        ({ htmlDom, url }) => {
            const variantCode = extractVariantCodeFromUrl(url);
            if (variantCode) {
                return extractFromVariant(
                    htmlDom,
                    (item) =>
                        typeof item === "object" &&
                        item !== null &&
                        "@type" in item &&
                        item["@type"] === "Product" &&
                        "productID" in item &&
                        item.productID === variantCode,
                    (data) => extractImage(data),
                    () => extractFromJsonLd(htmlDom, "Product", (data) => extractImage(data))
                );
            }
            // Fallback to first Product found
            return extractFromJsonLd(htmlDom, "Product", (data) => extractImage(data));
        }
    ],
    price: [
        ({ htmlDom, url }) => {
            const variantCode = extractVariantCodeFromUrl(url);
            if (variantCode) {
                return extractFromVariant(
                    htmlDom,
                    (item) =>
                        typeof item === "object" &&
                        item !== null &&
                        "@type" in item &&
                        item["@type"] === "Product" &&
                        "productID" in item &&
                        item.productID === variantCode,
                    (data) => extractPrice(data),
                    () => extractFromJsonLd(htmlDom, "Product", (data) => extractPrice(data))
                );
            }
            // Fallback to first Product found
            return extractFromJsonLd(htmlDom, "Product", (data) => extractPrice(data));
        }
    ],
    currency: [
        ({ htmlDom, url }) => {
            const variantCode = extractVariantCodeFromUrl(url);
            if (variantCode) {
                return extractFromVariant(
                    htmlDom,
                    (item) =>
                        typeof item === "object" &&
                        item !== null &&
                        "@type" in item &&
                        item["@type"] === "Product" &&
                        "productID" in item &&
                        item.productID === variantCode,
                    (data) => extractCurrency(data),
                    () => extractFromJsonLd(htmlDom, "Product", (data) => extractCurrency(data))
                );
            }
            // Fallback to first Product found
            return extractFromJsonLd(htmlDom, "Product", (data) => extractCurrency(data));
        }
    ],
    sku: [
        ({ htmlDom, url }) => {
            const variantCode = extractVariantCodeFromUrl(url);
            if (variantCode) {
                return extractFromVariant(
                    htmlDom,
                    (item) =>
                        typeof item === "object" &&
                        item !== null &&
                        "@type" in item &&
                        item["@type"] === "Product" &&
                        "productID" in item &&
                        item.productID === variantCode,
                    (data) => extractSku(data, "productID", "gtin13"),
                    () => extractFromJsonLd(htmlDom, "Product", (data) => extractSku(data, "productID", "gtin13"))
                );
            }
            // Fallback to first Product found
            return extractFromJsonLd(htmlDom, "Product", (data) => extractSku(data, "productID", "gtin13"));
        }
    ],
    brand: [
        ({ htmlDom, url }) => {
            const variantCode = extractVariantCodeFromUrl(url);
            if (variantCode) {
                return extractFromVariant(
                    htmlDom,
                    (item) =>
                        typeof item === "object" &&
                        item !== null &&
                        "@type" in item &&
                        item["@type"] === "Product" &&
                        "productID" in item &&
                        item.productID === variantCode,
                    (data) => extractBrand(data),
                    () => extractFromJsonLd(htmlDom, "Product", (data) => extractBrand(data))
                );
            }
            // Fallback to first Product found
            return extractFromJsonLd(htmlDom, "Product", (data) => extractBrand(data));
        }
    ],
    availability: [
        ({ htmlDom, url }) => {
            const variantCode = extractVariantCodeFromUrl(url);
            if (variantCode) {
                return extractFromVariant(
                    htmlDom,
                    (item) =>
                        typeof item === "object" &&
                        item !== null &&
                        "@type" in item &&
                        item["@type"] === "Product" &&
                        "productID" in item &&
                        item.productID === variantCode,
                    (data) => extractAvailability(data),
                    () => extractFromJsonLd(htmlDom, "Product", (data) => extractAvailability(data))
                );
            }
            // Fallback to first Product found
            return extractFromJsonLd(htmlDom, "Product", (data) => extractAvailability(data));
        }
    ],
    condition: [],
    mpn: [],
    asin: [],
    hostname: [],
    retailer: [],
    title: []
});
