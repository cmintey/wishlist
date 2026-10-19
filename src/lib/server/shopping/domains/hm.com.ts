import type { ShoppingDomainRules } from "../helpers";
import { rulesForDomain } from "../helpers";
import {
    extractStringField,
    extractImage,
    extractPrice,
    extractCurrency,
    extractBrand,
    extractFromProductGroup
} from "../domain-helpers";

/**
 * Custom parser for hm.com.
 *
 * H&M exposes a ProductGroup JSON-LD with a `hasVariant` array.
 * We simply pick the first variant and extract its fields.
 * If anything fails, we return `undefined` so the base parser can take over.
 */
const domains = ["hm.com"];

export const hmComRules: ShoppingDomainRules = rulesForDomain(domains, {
    name: [
        ({ htmlDom }) => {
            return extractFromProductGroup(htmlDom, (data) => extractStringField(data, "name"));
        }
    ],
    image: [
        ({ htmlDom }) => {
            return extractFromProductGroup(htmlDom, (data) => extractImage(data));
        }
    ],
    price: [
        ({ htmlDom }) => {
            return extractFromProductGroup(htmlDom, (data) => extractPrice(data));
        }
    ],
    currency: [
        ({ htmlDom }) => {
            return extractFromProductGroup(htmlDom, (data) => extractCurrency(data));
        }
    ],
    sku: [
        ({ htmlDom }) => {
            return extractFromProductGroup(
                htmlDom,
                (data) => extractStringField(data, "sku") || extractStringField(data, "productGroupID")
            );
        }
    ],
    brand: [
        ({ htmlDom }) => {
            return extractFromProductGroup(htmlDom, (data) => extractBrand(data));
        }
    ],
    condition: [],
    mpn: [],
    availability: [],
    asin: [],
    hostname: [],
    retailer: [],
    title: []
});
