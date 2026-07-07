import { browser } from "$app/environment";
import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import { getPrimaryLang, getLocale, defaultLang } from "./i18n";

export const init = async (locale?: string): Promise<ZxcvbnFactory> => {
    const locale_ = locale ? locale : browser ? getLocale() : defaultLang.code;

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

    return new ZxcvbnFactory({
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
    })
};

export const meterLabel = [
    "general.very-weak",
    "general.weak",
    "general.moderate",
    "general.strong",
    "general.very-strong"
];
export const strengthOptions = ["general.off", ...meterLabel];
