import { register, init, getLocaleFromNavigator } from "svelte-i18n";

export const initLang = async () => {
    register("en", () => import("../i18n/en.json"));

    await init({
        fallbackLocale: "en",
        initialLocale: getLocaleFromNavigator()
    });
};
