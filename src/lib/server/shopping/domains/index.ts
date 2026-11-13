/**
 * Domain specific shopping parsers.
 *
 * Each file in this folder exports a `ShoppingDomainRules` object describing
 * rules that should run *before* the default shopping parser, but only for
 * matching URLs (using the `forDomains` helper).
 *
 * To add a new domain parser:
 *  - create `my-domain.ts` next to this file,
 *  - export `myDomainRules: ShoppingDomainRules`,
 *  - add it to the `domainRuleSets` array below.
 */

import type { ShoppingDomainRules } from "../helpers";
import { mergeDomainRules } from "../helpers";
import { hmComRules } from "./hm.com";
import { bolComRules } from "./bol.com";
import { ikeaComRules } from "./ikea.com";

/**
 * List of all domain rule sets.
 * New domain implementations should be added here.
 */
export const domainRuleSets: ShoppingDomainRules[] = [hmComRules, bolComRules, ikeaComRules];

/**
 * Single merged rule set for all domains.
 * Fields are concatenated in the order of `domainRuleSets`.
 */
export const domainRules: ShoppingDomainRules = mergeDomainRules(domainRuleSets);

export default domainRules;
