import { browser } from "$app/environment";
import { getPrimaryLang, getLocale, defaultLocale } from "./i18n";

export const loadOptions = async (locale?: string) => {
    const locale_ = locale ? locale : browser ? getLocale() : defaultLocale;

    const langCommon = await import("@zxcvbn-ts/language-common");
    const langEn = await import("@zxcvbn-ts/language-en");
    let langUser: any;
    if (locale_.toLowerCase() === "es-es") {
        langUser = await import("@zxcvbn-ts/language-es-es");
    } else if (getPrimaryLang(locale_) === "fr") {
        langUser = await import("@zxcvbn-ts/language-fr");
    } else if (getPrimaryLang(locale_) === "de") {
        langUser = await import("@zxcvbn-ts/language-de");
    }

    return {
        dictionary: {
            ...langCommon.dictionary,
            ...langEn.dictionary,
            ...langUser?.dictionary
        },
        graphs: langCommon.adjacencyGraphs,
        translations: {
            ...langEn.translations,
            ...langUser?.translations
        }
    };
};

export const meterLabel = [
    "general.very-weak",
    "general.weak",
    "general.moderate",
    "general.strong",
    "general.very-strong"
];
export const strengthOptions = ["general.off", ...meterLabel];
