import type { Rules, RulesOptions, RulesTestOptions } from "metascraper";
import pkg from "@metascraper/helpers";

const { memoizeOne, toRule, title } = pkg;

export type HtmlDomType = RulesTestOptions["htmlDom"];

/**
 * Type guard to check if a value is a record (object with string keys).
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

/**
 * Safely get a property from an unknown object.
 */
export const getProperty = (obj: unknown, key: string): unknown => {
    return isRecord(obj) && key in obj ? obj[key] : undefined;
};

/**
 * Shape of the shopping metadata fields used by the metascraper plugin.
 * Each field is represented by an ordered list of `RulesOptions` rules.
 */
export interface ShoppingMetadataRules {
    brand: Array<RulesOptions>;
    name: Array<RulesOptions>;
    image: Array<RulesOptions>;
    currency: Array<RulesOptions>;
    sku: Array<RulesOptions>;
    price: Array<RulesOptions>;
    condition: Array<RulesOptions>;
    mpn: Array<RulesOptions>;
    availability: Array<RulesOptions>;
    asin: Array<RulesOptions>;
    hostname: Array<RulesOptions>;
    retailer: Array<RulesOptions>;
    title: Array<RulesOptions>;
}

export type ShoppingDomainRules = ShoppingMetadataRules & Rules;

/**
 * Type for domain rules where all fields must be explicitly set (even if empty arrays).
 * This ensures consistency and makes it clear which fields a domain parser handles.
 */
export type RequiredDomainRules = {
    [K in keyof ShoppingMetadataRules]: RulesOptions[];
};

/**
 * Simple helper to merge multiple domain rule objects together.
 * Fields with rules are concatenated in the order provided.
 */
export const mergeDomainRules = (domains: ShoppingDomainRules[]): ShoppingDomainRules => {
    const merged: ShoppingDomainRules = {} as ShoppingDomainRules;

    for (const domain of domains) {
        for (const key in domain) {
            const k = key as keyof ShoppingDomainRules;
            if (!domain[k]) continue;

            if (!merged[k]) {
                merged[k] = [];
            }

            merged[k] = [...(merged[k] as RulesOptions[]), ...(domain[k] as RulesOptions[])];
        }
    }

    return merged;
};

/**
 * Wrap a `Check` so that it only runs for matching domains / URLs.
 *
 * - `domains` can be an array of hostnames (e.g. "hm.com", "www.hm.com")
 *   or a predicate that receives the full URL and returns `true` when the
 *   rule should run.
 *
 * When the rule does not match the current URL it returns `undefined`,
 * allowing metascraper to fall back to the default rules.
 */
const forDomains = (domains: string[] | ((url: string) => boolean), check: RulesOptions): RulesOptions => {
    return (ctx) => {
        const { url } = ctx;
        const matches =
            typeof domains === "function"
                ? domains(url)
                : (() => {
                      let hostname: string;
                      try {
                          hostname = new URL(url).hostname.replace(/^www\./, "");
                      } catch {
                          return false;
                      }

                      return domains.some((d) => {
                          const normalized = d.replace(/^www\./, "");
                          return (
                              hostname === normalized || hostname.endsWith(`.${normalized}`) // allow subdomains
                          );
                      });
                  })();

        if (!matches) return;
        return check(ctx);
    };
};

/**
 * Wrap all rules in a domain rules object with `forDomains`.
 * This allows domain-specific implementations to define rules without
 * wrapping each field individually.
 *
 * All fields must be explicitly set, even if they're empty arrays.
 * This ensures consistency and makes it clear which fields a domain parser handles.
 *
 * @param domains - Array of hostnames or a predicate function
 * @param rules - RequiredDomainRules object with all fields set (even if empty arrays)
 * @returns ShoppingDomainRules with all rules wrapped in forDomains
 */
export const rulesForDomain = (
    domains: string[] | ((url: string) => boolean),
    rules: RequiredDomainRules
): ShoppingDomainRules => {
    const wrapped: ShoppingDomainRules = {} as ShoppingDomainRules;

    for (const key in rules) {
        const fieldKey = key as keyof ShoppingMetadataRules;
        const fieldRules = rules[fieldKey];

        // Wrap all rules (including empty arrays) with forDomains
        // fieldRules is guaranteed to exist since RequiredDomainRules requires all fields
        if (fieldRules) {
            wrapped[fieldKey] = fieldRules.map((rule) => forDomains(domains, rule));
        }
    }

    return wrapped;
};

/**
 * Helpers for domain-specific implementations that want to read JSON-LD data.
 * These mirror the logic used in the base shopping parser so domain parsers
 * can stay small and focused.
 */
export const jsonLd = memoizeOne(($: HtmlDomType): unknown | null => {
    try {
        const html = $('script[type="application/ld+json"]').html();
        if (!html) return null;
        const jsonld = JSON.parse(html);
        return jsonld;
    } catch (err) {
        // Log error for debugging but don't throw - let parser fall back gracefully
        console.warn("Failed to parse JSON-LD:", err instanceof Error ? err.message : err);
        return null;
    }
});

/**
 * Find a specific JSON-LD block by its `@type`.
 *
 * This scans all <script type="application/ld+json"> tags on the page and
 * returns the first one whose `@type` matches the requested type. If no such
 * block is found, it returns undefined.
 *
 * Memoized so repeated lookups for the same (type, htmlDom) pair are cheap.
 */
export const findJsonLdByType = memoizeOne((type: string, $: HtmlDomType): unknown | undefined => {
    const scripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < scripts.length; i++) {
        const el = scripts[i];
        try {
            const html = $(el).html();
            if (!html) continue;
            const json: unknown = JSON.parse(html);
            if (typeof json !== "object" || json === null) continue;

            const jsonObj = json as Record<string, unknown>;
            const t = jsonObj["@type"];

            if (!t) continue;

            if (Array.isArray(t) ? t.includes(type) : t === type) {
                return json;
            }
        } catch (err) {
            // Log error for debugging but ignore parse errors and keep scanning
            console.warn(`Failed to parse JSON-LD script ${i}:`, err instanceof Error ? err.message : err);
            continue;
        }
    }
    return undefined;
});

export const jsonLdGraph = memoizeOne(($: HtmlDomType): unknown[] | null => {
    try {
        const html = $('script[type="application/ld+json"]').html();
        if (!html) return null;
        const jsonld: unknown = JSON.parse(html);
        if (typeof jsonld === "object" && jsonld !== null && "@graph" in jsonld) {
            const graph = jsonld["@graph"];
            return Array.isArray(graph) ? graph : null;
        }
        return null;
    } catch (err) {
        console.warn("Failed to parse JSON-LD graph:", err instanceof Error ? err.message : err);
        return null;
    }
});

export const jsonLdGraphProduct = memoizeOne(($: HtmlDomType): unknown | null => {
    const jsonld = jsonLdGraph($);

    if (jsonld) {
        const products = jsonld.filter((i: unknown): i is { "@type": string } => {
            return typeof i === "object" && i !== null && "@type" in i && i["@type"] === "Product";
        });
        return products.length > 0 ? products[0] : null;
    }
    return null;
});

export const jsonLdLastBreadcrumb = memoizeOne(($: HtmlDomType): unknown | null => {
    const jsonld = jsonLdGraph($);
    if (jsonld) {
        const breadcrumbs = jsonld.filter((i: unknown): i is { "@type": string; itemListElement?: unknown[] } => {
            return typeof i === "object" && i !== null && "@type" in i && i["@type"] === "BreadcrumbList";
        });
        const breadcrumb = breadcrumbs.length > 0 && breadcrumbs[0];
        if (breadcrumb && "itemListElement" in breadcrumb && Array.isArray(breadcrumb.itemListElement)) {
            const items = breadcrumb.itemListElement;
            if (items.length > 0) {
                return items[items.length - 1];
            }
        }
    }

    return null;
});

export const toTitle = toRule(title, { removeSeparator: false });

export const toPriceFormat = (price: string | undefined | null): number | undefined => {
    if (!price) return undefined;

    if (typeof price === "string") {
        // Remove non-numeric characters and symbols like $, € and others others.
        // except for '.' and ','
        price = price.replace(/[^\d.,]/g, "");

        price = /^(\d+\.?){1}(\.\d{2,3})*,\d{1,2}$/.test(price)
            ? price.replace(/\./g, "").replace(",", ".") // case 1: price is formatted as '12.345,67'
            : price.replace(/,/g, ""); // case 2: price is formatted as '12,345.67'
    }

    const num = parseFloat(price);

    if (Number.isNaN(num)) {
        return;
    }

    return +num.toFixed(2);
};

export const getHostname = (url: string): string => {
    return new URL(url).hostname.replace("www.", "");
};

/**
 * Safely parse a URL and return null if invalid.
 * This prevents uncaught exceptions when parsing malformed URLs.
 */
export const safeUrlParse = (url: string): URL | null => {
    try {
        return new URL(url);
    } catch {
        return null;
    }
};
