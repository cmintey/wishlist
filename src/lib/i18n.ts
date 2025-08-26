import { register, init, format, waitLocale } from "svelte-i18n";
import { derived, type Readable } from "svelte/store";
import type { MessageObject, MessageFormatter } from "./server/i18n";
import { getContext, setContext } from "svelte";
import { dev } from "$app/environment";

export interface Lang {
    name: string;
    endonym: string;
    code: string;
    loader: () => Promise<object>;
    rtl?: boolean;
    hidden?: boolean;
}

export const defaultLang: Lang = {
    name: "English",
    endonym: "English",
    code: "en",
    loader: () => import("../i18n/en.json")
};

export const supportedLangs: Lang[] = [
    { name: "Dutch", endonym: "Nederlands", code: "nl", loader: () => import("../i18n/nl.json") },
    defaultLang,
    { name: "French", endonym: "Français", code: "fr", loader: () => import("../i18n/fr.json") },
    { name: "German", endonym: "Deutsch", code: "de", loader: () => import("../i18n/de.json") },
    { name: "Norwegian", endonym: "Norsk", code: "no", loader: () => import("../i18n/nb.json") },
    {
        name: "Norwegian Bokmål",
        endonym: "Norsk Bokmål",
        code: "nb",
        loader: () => import("../i18n/nb.json"),
        hidden: true
    },
    {
        name: "Norwegian Nynorsk",
        endonym: "Norsk Nynorsk",
        code: "nn",
        loader: () => import("../i18n/nb.json"),
        hidden: true
    },
    { name: "Persian", endonym: "فارسی", code: "fa", loader: () => import("../i18n/fa.json"), rtl: true },
    { name: "Polish", endonym: "Polski", code: "pl", loader: () => import("../i18n/pl.json") },
    { name: "Portuguese", endonym: "Português", code: "pt", loader: () => import("../i18n/pt.json") },
    { name: "Russian", endonym: "Русский язык", code: "ru", loader: () => import("../i18n/ru.json") },
    { name: "Spanish", endonym: "Español", code: "es", loader: () => import("../i18n/es.json") },
    { name: "Swedish", endonym: "Svenska", code: "sv", loader: () => import("../i18n/sv.json") },
    { name: "Ukrainian", endonym: "Українська", code: "uk", loader: () => import("../i18n/uk.json") },
    { name: "Vietnamese", endonym: "tiếng Việt", code: "vi", loader: () => import("../i18n/vi.json") },
    {
        name: "Development (keys only)",
        endonym: "Development (keys only)",
        code: "dev",
        loader: () => Promise.resolve({}),
        hidden: !dev
    }
];

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
    return (getContext("locale") as string) || defaultLang.code;
}

export const initLang = async (locale: string) => {
    supportedLangs.forEach((lang) => register(lang.code, lang.loader));

    await init({
        fallbackLocale: dev ? "dev" : defaultLang.code,
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

export const getClosestAvailablePreferredLanguage = (preferredLanguage: string | undefined | null) => {
    return preferredLanguage ? getClosestAvailableLocale([preferredLanguage]) : defaultLang;
};

export const getClosestAvailableLocale = (langs: readonly string[]): Lang => {
    const availableLangs = langs
        .map((lang) => supportedLangs.find((supportedLang) => supportedLang.code === lang))
        .filter((lang) => lang !== undefined);
    return availableLangs.length > 0 ? availableLangs[0] : defaultLang;
};

export const getPrimaryLang = (locale: string) => {
    return locale?.toLowerCase().split("-")[0];
};
