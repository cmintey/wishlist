import { get } from "svelte/store";
import { locale } from "svelte-i18n";

export const loadOptions = async () => {
    const lang = get(locale);
    const langCommon = await import("@zxcvbn-ts/language-common");
    const langEn = await import("@zxcvbn-ts/language-en");
    let langUser: any;
    if (lang?.toLowerCase() === "es-es") {
        langUser = await import(`@zxcvbn-ts/language-es-es`);
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
