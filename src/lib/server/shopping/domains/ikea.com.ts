import type { ShoppingDomainRules } from "../helpers";
import { rulesForDomain } from "../helpers";
import {
    extractStringField,
    extractImage,
    extractPrice,
    extractCurrency,
    extractBrand,
    extractAvailability,
    extractMpn,
    extractSku,
    extractFromJsonLd
} from "../domain-helpers";

/**
 * Custom parser for ikea.com.
 *
 * IKEA exposes a Product JSON-LD with product information.
 * We extract fields directly from the Product JSON-LD structure.
 * If anything fails, we return `undefined` so the base parser can take over.
 */
const domains = ["ikea.com"];

export const ikeaComRules: ShoppingDomainRules = rulesForDomain(domains, {
    name: [
        ({ htmlDom }) => {
            return extractFromJsonLd(htmlDom, "Product", (data) => extractStringField(data, "name"));
        }
    ],
    image: [
        ({ htmlDom }) => {
            return extractFromJsonLd(htmlDom, "Product", (data) => extractImage(data));
        }
    ],
    price: [
        ({ htmlDom }) => {
            return extractFromJsonLd(htmlDom, "Product", (data) => extractPrice(data));
        }
    ],
    currency: [
        ({ htmlDom }) => {
            return extractFromJsonLd(htmlDom, "Product", (data) => extractCurrency(data));
        }
    ],
    sku: [
        ({ htmlDom }) => {
            return extractFromJsonLd(htmlDom, "Product", (data) => extractSku(data, "sku", "mpn"));
        }
    ],
    brand: [
        ({ htmlDom }) => {
            return extractFromJsonLd(htmlDom, "Product", (data) => extractBrand(data));
        }
    ],
    availability: [
        ({ htmlDom }) => {
            return extractFromJsonLd(htmlDom, "Product", (data) => extractAvailability(data));
        }
    ],
    mpn: [
        ({ htmlDom }) => {
            return extractFromJsonLd(htmlDom, "Product", (data) => extractMpn(data));
        }
    ],
    condition: [],
    asin: [],
    hostname: [],
    retailer: [],
    title: []
});
