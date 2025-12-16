import type { LayoutLoad } from "./$types";
import { getClosestAvailableLocale, getClosestAvailablePreferredLanguage, initFormatter, initLang } from "$lib/i18n";
import { browser } from "$app/environment";

export const load = (async ({ data }) => {
    let locale: string;
    if (data.user?.preferredLanguage) {
        locale = getClosestAvailablePreferredLanguage(data.user.preferredLanguage)?.code ?? data.locale;
    } else if (browser) {
        locale = getClosestAvailableLocale(window.navigator.languages).code;
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
