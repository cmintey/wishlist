import { browser, dev } from "$app/environment";
import { register, init, getLocaleFromNavigator, locale, t, waitLocale } from "svelte-i18n";
import { get, type Unsubscriber } from "svelte/store";

const defaultLocale = "en";

export const getFormatter = async () => {
    let unsubscribe: Unsubscriber | undefined;
    await new Promise((resolve) => {
        unsubscribe = locale.subscribe((value) => value && resolve(value));
    });
    unsubscribe?.();

    await waitLocale();
    return get(t);
};

export const initLang = async () => {
    register("dev", () => Promise.resolve({}));
    register("en", () => import("../i18n/en.json"));

    await init({
        fallbackLocale: dev ? "dev" : defaultLocale,
        initialLocale: browser ? getLocaleFromNavigator() : defaultLocale
    });
};
