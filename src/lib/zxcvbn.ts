import { get } from "svelte/store";
import { locale } from "svelte-i18n";
import { getPrimaryLang } from "./i18n";

export const loadOptions = async () => {
    const langCommon = await import("@zxcvbn-ts/language-common");
    const langEn = await import("@zxcvbn-ts/language-en");
    let langUser: any;
    if (get(locale)?.toLowerCase() === "es-es") {
        langUser = await import("@zxcvbn-ts/language-es-es");
    } else if (getPrimaryLang() === "fr") {
        langUser = await import("@zxcvbn-ts/language-fr");
    } else if (getPrimaryLang() === "de") {
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
