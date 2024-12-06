import { locale, waitLocale } from "svelte-i18n";
import type { LayoutLoad } from "./$types";
import { getClosestAvailableLocale, initLang } from "$lib/i18n";
import { browser } from "$app/environment";

export const load = (async () => {
    await initLang();
    if (browser) {
        const lang = getClosestAvailableLocale(window.navigator.languages);
        if (lang) locale.set(lang);
    }
    await waitLocale();
}) satisfies LayoutLoad;
