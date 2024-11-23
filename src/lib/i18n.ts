import { browser } from "$app/environment";
import { register, init, getLocaleFromNavigator, locale, t, waitLocale } from "svelte-i18n";
import { get, type Unsubscriber } from "svelte/store";

const defaultLocale = "en";

export async function getFormatter() {
    let unsubscribe: Unsubscriber | undefined;
    await new Promise((resolve) => {
        unsubscribe = locale.subscribe((value) => value && resolve(value));
    });
    unsubscribe?.();

    await waitLocale();
    return get(t);
}

export const initLang = async () => {
    register("en", () => import("../i18n/en.json"));
    register("es", () => import("../i18n/es.json"));

    await init({
        fallbackLocale: defaultLocale,
        initialLocale: browser ? getLocaleFromNavigator() : defaultLocale
    });
};
