import type { RulesTestOptions } from "metascraper";
import { findJsonLdByType, isRecord, getProperty } from "./helpers";

type HtmlDomType = RulesTestOptions["htmlDom"];

/**
 * Extract a string field from JSON-LD data with type safety.
 * Returns undefined if the field is not a string.
 */
export const extractStringField = (data: unknown, fieldPath: string): string | undefined => {
    const value = getProperty(data, fieldPath);
    return typeof value === "string" ? value : undefined;
};

/**
 * Extract a numeric field from JSON-LD data, handling both string and number types.
 * Returns the value as a string if found, undefined otherwise.
 */
export const extractNumericField = (data: unknown, fieldPath: string): string | undefined => {
    const value = getProperty(data, fieldPath);
    return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
};

/**
 * Extract brand information from JSON-LD data.
 * Handles both string brand names and brand objects with name property.
 */
export const extractBrand = (data: unknown): string | undefined => {
    const brand = getProperty(data, "brand");
    if (isRecord(brand) && "name" in brand && typeof brand.name === "string") {
        return brand.name;
    }
    return typeof brand === "string" ? brand : undefined;
};

/**
 * Extract image URL from various JSON-LD image structures.
 * Handles:
 * - String URLs
 * - ImageObject with url property
 * - ImageObject with contentUrl property
 * - Arrays of the above
 */
export const extractImage = (data: unknown): string | undefined => {
    const image = getProperty(data, "image");

    // Handle arrays - take first valid image
    if (Array.isArray(image) && image.length > 0) {
        return extractImage(image[0]);
    }

    // Handle ImageObject
    if (isRecord(image) && image["@type"] === "ImageObject") {
        // Try contentUrl first (common in IKEA), then url
        const contentUrl = getProperty(image, "contentUrl");
        const url = getProperty(image, "url");
        return typeof contentUrl === "string" ? contentUrl : typeof url === "string" ? url : undefined;
    }

    // Handle string URLs
    return typeof image === "string" ? image : undefined;
};

/**
 * Extract offers-related fields (price, currency, availability) from JSON-LD data.
 * Provides safe extraction with proper type checking.
 */
export const extractOffersField = (
    data: unknown,
    field: "price" | "priceCurrency" | "availability"
): string | undefined => {
    const offers = getProperty(data, "offers");
    if (!isRecord(offers)) return undefined;

    const value = getProperty(offers, field);
    return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
};

/**
 * Extract price from JSON-LD offers with proper formatting.
 */
export const extractPrice = (data: unknown): string | undefined => {
    return extractOffersField(data, "price");
};

/**
 * Extract currency from JSON-LD offers.
 */
export const extractCurrency = (data: unknown): string | undefined => {
    return extractOffersField(data, "priceCurrency");
};

/**
 * Extract availability from JSON-LD offers.
 * Handles URL format availability (e.g., "https://schema.org/InStock")
 * by extracting just the last part of the URL.
 */
export const extractAvailability = (data: unknown): string | undefined => {
    const availability = extractOffersField(data, "availability");
    if (!availability) return undefined;

    // If it's a schema.org URL, extract just the status
    if (availability.includes("schema.org/")) {
        return availability.split("/").pop();
    }

    return availability;
};

/**
 * Extract SKU information with fallback options.
 * Tries multiple fields in order of preference.
 */
export const extractSku = (data: unknown, ...fallbackFields: string[]): string | undefined => {
    // Try primary sku field first
    const sku = extractStringField(data, "sku");
    if (sku) return sku;

    // Try fallback fields
    for (const field of fallbackFields) {
        const value = extractStringField(data, field);
        if (value) return value;
    }

    return undefined;
};

/**
 * Extract condition information from JSON-LD.
 * Handles both direct condition fields and offers.itemCondition.
 */
export const extractCondition = (data: unknown): string | undefined => {
    // Try direct condition field
    const condition = extractStringField(data, "itemCondition");
    if (condition) return condition;

    // Try offers.itemCondition
    const offers = getProperty(data, "offers");
    if (isRecord(offers)) {
        const offersCondition = extractStringField(offers, "itemCondition");
        if (offersCondition) return offersCondition;
    }

    return undefined;
};

/**
 * Extract MPN (Manufacturer Part Number) from JSON-LD.
 */
export const extractMpn = (data: unknown): string | undefined => {
    return extractStringField(data, "mpn");
};

/**
 * Generic extractor for domain-specific JSON-LD patterns.
 * This function encapsulates the common pattern of:
 * 1. Find JSON-LD by type
 * 2. Extract a specific field using a provided extractor
 * 3. Apply optional fallback logic
 */
export const extractFromJsonLd = (
    htmlDom: HtmlDomType,
    jsonType: string,
    extractor: (data: unknown) => string | undefined,
    fallback?: () => string | undefined
): string | undefined => {
    const data = findJsonLdByType(jsonType, htmlDom);
    if (!data) return fallback?.();

    const result = extractor(data);
    return result ?? fallback?.();
};

/**
 * Extract from variant-based JSON-LD structures.
 * Used by domains like bol.com that have multiple product variants.
 */
export const extractFromVariant = (
    htmlDom: HtmlDomType,
    variantSelector: (data: unknown) => boolean,
    extractor: (data: unknown) => string | undefined,
    fallback?: () => string | undefined
): string | undefined => {
    const scripts = htmlDom('script[type="application/ld+json"]');

    for (let i = 0; i < scripts.length; i++) {
        const el = scripts[i];
        try {
            const html = htmlDom(el).html();
            if (!html) continue;
            const json: unknown = JSON.parse(html);

            // Handle both single objects and arrays
            let items: unknown[] = [];
            if (Array.isArray(json)) {
                items = json;
            } else if (typeof json === "object" && json !== null && "@graph" in json) {
                const graph = json["@graph"];
                items = Array.isArray(graph) ? graph : [json];
            } else {
                items = [json];
            }

            for (const item of items) {
                if (variantSelector(item)) {
                    const result = extractor(item);
                    if (result) return result;
                }
            }
        } catch {
            // ignore parse errors and keep scanning
        }
    }

    return fallback?.();
};

/**
 * Extract from ProductGroup JSON-LD with variant selection.
 * Used by domains like hm.com that have ProductGroup with hasVariant array.
 */
export const extractFromProductGroup = (
    htmlDom: HtmlDomType,
    extractor: (data: unknown) => string | undefined,
    preferVariant: boolean = true
): string | undefined => {
    const data = findJsonLdByType("ProductGroup", htmlDom);
    if (!data) return undefined;

    // Try variant first if preferred
    if (preferVariant) {
        const hasVariant = getProperty(data, "hasVariant");
        const variant = Array.isArray(hasVariant) && hasVariant.length > 0 ? hasVariant[0] : undefined;
        if (variant) {
            const result = extractor(variant);
            if (result) return result;
        }
    }

    // Fallback to ProductGroup itself
    return extractor(data);
};
