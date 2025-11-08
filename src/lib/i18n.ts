import { register, init, format, waitLocale } from "svelte-i18n";
import { derived, type Readable } from "svelte/store";
import type { MessageObject, MessageFormatter } from "./server/i18n";
import { createContext } from "svelte";
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

// Endonyms: https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
export const supportedLangs: Lang[] = [
    { name: "Czech", endonym: "Čeština", code: "cs", loader: () => import("../i18n/cs.json") },
    { name: "Danish", endonym: "Dansk", code: "da", loader: () => import("../i18n/da.json") },
    { name: "Dutch", endonym: "Nederlands", code: "nl", loader: () => import("../i18n/nl.json") },
    defaultLang,
    { name: "French", endonym: "Français", code: "fr", loader: () => import("../i18n/fr.json") },
    { name: "German", endonym: "Deutsch", code: "de", loader: () => import("../i18n/de.json") },
    { name: "Greek", endonym: "Νέα Ελληνικά", code: "el", loader: () => import("../i18n/el.json") },
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
    { name: "Mongolian", endonym: "Монгол хэл", code: "mn", loader: () => import("../i18n/mn.json") },
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

const supportedLangsByCode: Record<string, Lang> = supportedLangs.reduce(
    (accum, lang) => ({ ...accum, [lang.code]: lang }),
    {}
);

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

export const [getFormatter, setFormatter] = createContext<Readable<MessageFormatter>>();
export const [getLocale, setLocale] = createContext<string>();

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
    return preferredLanguage ? getClosestAvailableLocale([preferredLanguage]) : null;
};

export const getClosestAvailableLocale = (langs: readonly string[]): Lang => {
    const langsAndSubLangs = langs.flatMap((lang) => getSubLocales(lang));
    for (const lang of langsAndSubLangs) {
        if (lang in supportedLangsByCode) {
            return supportedLangsByCode[lang];
        }
    }
    return defaultLang;
};

export const getPrimaryLang = (locale: string) => {
    return locale?.toLowerCase().split("-")[0];
};

// https://github.com/kaisermann/svelte-i18n/blob/780932a3e1270d521d348aac8ba03be9df309f04/src/runtime/stores/locale.ts#L11
const getSubLocales = (refLocale: string) => {
    return refLocale
        .split("-")
        .map((_, i, arr) => arr.slice(0, i + 1).join("-"))
        .reverse();
};
