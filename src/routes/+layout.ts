import { browser } from "$app/environment";
import { locale, waitLocale } from "svelte-i18n";
import type { LayoutLoad } from "./$types";
import { initLang } from "$lib/i18n";

export const load = (async () => {
    await initLang();
    if (browser) {
        locale.set(window.navigator.language);
    }
    await waitLocale();
}) satisfies LayoutLoad;
