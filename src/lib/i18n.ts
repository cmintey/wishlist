import { register, init, locale, locales, format, waitLocale, getLocaleFromNavigator } from "svelte-i18n";
import { derived, get, type Readable } from "svelte/store";
import type { MessageObject, MessageFormatter } from "./server/i18n";
import { getContext, setContext } from "svelte";
import { browser } from "$app/environment";

export const defaultLocale = "en";

export async function initFormatter(locale: string) {
    await waitLocale(locale);
    return derived(format, ($format) => {
        return (id: string, options?: Omit<MessageObject, "id">) => {
            let options_: Omit<MessageObject, "id"> = { locale };
            if (options) {
                options_ = { ...options };
            }
            return $format(id, options_);
        };
    });
}

export function setFormatter(t: Readable<MessageFormatter>) {
    setContext("translator", t);
}

export function getFormatter() {
    return getContext("translator") as Readable<MessageFormatter>;
}

export function setLocale(locale: string) {
    setContext("locale", locale);
}

export function getLocale() {
    return (getContext("locale") as string) || defaultLocale;
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
