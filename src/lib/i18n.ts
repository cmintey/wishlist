import { browser } from "$app/environment";
import { getRequestEvent } from "$app/server";
import { register, init, getLocaleFromNavigator, locale, t, waitLocale, locales, format } from "svelte-i18n";
import { get } from "svelte/store";

const defaultLocale = "en";

const _f = ($t: typeof t) => get($t);
export type MessageFormatter = ReturnType<typeof _f>;
type MessageFormatterParams = Parameters<MessageFormatter>;
export type MessageObject = Exclude<MessageFormatterParams[0], string>;

export async function getFormatter(locale?: string) {
    if (!locale) {
        const evt = getRequestEvent();
        locale = evt.locals.locale;
    }
    await waitLocale(locale);
    return (id: string, options?: Omit<MessageObject, "id">) => {
        let options_: Omit<MessageObject, "id"> = { locale };
        if (options) {
            options_ = { ...options };
        }
        return get(format)(id, options_);
    };
}

export const initLang = async () => {
    register("en", () => import("../i18n/en.json"));
    register("es", () => import("../i18n/es.json"));
    register("fr", () => import("../i18n/fr.json"));
    register("sv", () => import("../i18n/sv.json"));
    register("de", () => import("../i18n/de.json"));
    register("ru", () => import("../i18n/ru.json"));
    register("pt", () => import("../i18n/pt.json"));
    register("pl", () => import("../i18n/pl.json"));
    register("nl", () => import("../i18n/nl.json"));
    register("vi", () => import("../i18n/vi.json"));
    register("no", () => import("../i18n/nb.json"));
    register("nb", () => import("../i18n/nb.json"));
    register("nn", () => import("../i18n/nb.json"));

    await init({
        fallbackLocale: defaultLocale,
        initialLocale: browser ? getLocaleFromNavigator() : defaultLocale
    });
};

export const parseAcceptLanguageHeader = (acceptLanguage: string | undefined | null) => {
    return acceptLanguage && acceptLanguage !== "*"
        ? acceptLanguage
              .split(",")
              .map((acceptLanguagePart) => {
                  const [acceptLanguageCode, qFactor = "1"] = acceptLanguagePart.split(";q=");
                  return { code: acceptLanguageCode.trim(), q: parseInt(qFactor) };
              })
              .sort((a, b) => b.q - a.q)
              .map((a) => a.code)
              .filter((locale) => locale !== "*")
        : [];
};

export const getClosestAvailableLocaleFromHeader = (acceptLanguage: string | undefined | null) => {
    const langs = parseAcceptLanguageHeader(acceptLanguage);
    return getClosestAvailableLocale(langs);
};

export const getClosestAvailableLocale = (langs: readonly string[]) => {
    const $locales = get(locales);
    return langs.find((lang) => $locales.find(($locale) => $locale === lang));
};

export const getPrimaryLang = () => {
    const lang = get(locale);
    return lang?.toLowerCase().split("-")[0];
};
