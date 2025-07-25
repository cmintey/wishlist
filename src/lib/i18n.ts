import { register, init, format, waitLocale } from "svelte-i18n";
import { derived, type Readable } from "svelte/store";
import type { MessageObject, MessageFormatter } from "./server/i18n";
import { getContext, setContext } from "svelte";

const supportedLangs = {
    de: () => import("../i18n/de.json"),
    en: () => import("../i18n/en.json"),
    es: () => import("../i18n/es.json"),
    fa: () => import("../i18n/fa.json"),
    fr: () => import("../i18n/fr.json"),
    nb: () => import("../i18n/nb.json"),
    nl: () => import("../i18n/nl.json"),
    nn: () => import("../i18n/nb.json"),
    no: () => import("../i18n/nb.json"),
    pl: () => import("../i18n/pl.json"),
    pt: () => import("../i18n/pt.json"),
    ru: () => import("../i18n/ru.json"),
    sv: () => import("../i18n/sv.json"),
    vi: () => import("../i18n/vi.json")
};

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

export const initLang = async (locale: string) => {
    Object.entries(supportedLangs).forEach(([lang, loader]) => register(lang, loader));

    await init({
        fallbackLocale: defaultLocale,
        initialLocale: locale
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
    return langs.find((lang) => Object.keys(supportedLangs).find((supportedLang) => supportedLang === lang));
};

export const getPrimaryLang = (locale: string) => {
    return locale?.toLowerCase().split("-")[0];
};
