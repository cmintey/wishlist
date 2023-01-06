//@ts-nocheck
import type { Rule } from "metascraper";
import { toPriceFormat } from "./helpers";

/**
 * Additional rules to be used for price getting
 **/
export default () => {
	const rules: Rule = {
		price: [
			({ htmlDom: $ }) => toPriceFormat($("span.a-offscreen", "span.a-price").html()),
			({ htmlDom: $ }) => toPriceFormat($("span.price-amount").html())
		]
	};
	return rules;
};
