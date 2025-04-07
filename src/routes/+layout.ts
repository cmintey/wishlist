import type { LayoutLoad } from "./$types";
import { defaultLocale, getClosestAvailableLocale, initFormatter, initLang } from "$lib/i18n";
import { browser } from "$app/environment";

export const load = (async ({ data }) => {
    await initLang();
    let locale;
    if (browser) {
        locale = getClosestAvailableLocale(window.navigator.languages) || defaultLocale;
    } else {
        locale = data.locale;
    }

    return {
        t: await initFormatter(locale),
        ...data,
        locale
    };
}) satisfies LayoutLoad;
