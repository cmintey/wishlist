import type { LayoutLoad } from "./$types";
import { defaultLocale, getClosestAvailableLocale, initFormatter, initLang } from "$lib/i18n";
import { browser } from "$app/environment";

export const load = (async ({ data }) => {
    let locale;
    if (browser) {
        locale = getClosestAvailableLocale(window.navigator.languages) || defaultLocale;
    } else {
        locale = data.locale;
    }
    await initLang(locale);

    return {
        t: await initFormatter(locale),
        ...data,
        locale
    };
}) satisfies LayoutLoad;
