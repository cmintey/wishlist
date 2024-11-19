export const loadOptions = async () => {
    const langCommon = await import("@zxcvbn-ts/language-common");
    const langEn = await import("@zxcvbn-ts/language-en");

    return {
        dictionary: {
            ...langCommon.dictionary,
            ...langEn.dictionary
        },
        graphs: langCommon.adjacencyGraphs,
        translations: langEn.translations
    };
};

export const meterLabel = ["Very weak", "Weak", "Moderate", "Strong", "Very Strong"];
export const strengthOptions = ["Off", ...meterLabel];
