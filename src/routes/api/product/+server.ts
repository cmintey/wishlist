import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { parseAcceptLanguageHeader } from "$lib/i18n";
import { getFormatter } from "$lib/server/i18n";
import { requireLoginOrError } from "$lib/server/auth";
import { fetchProduct } from "$lib/server/fetch-product";

export const GET: RequestHandler = async ({ request, url }) => {
    await requireLoginOrError();
    const $t = await getFormatter();
    const encodedUrl = url.searchParams.get("url");
    const acceptLanguage = request.headers?.get("accept-language");
    const locales = parseAcceptLanguageHeader(acceptLanguage);

    if (!encodedUrl) {
        error(400, $t("errors.must-specify-url-in-query-parameters"));
    }

    return await fetchProduct(decodeURI(encodedUrl), locales);
};
