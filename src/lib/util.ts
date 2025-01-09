export const trimToNull = (s: string | null) => {
    if (!s) {
        return null;
    }
    const sTrimed = s.trim();
    if (sTrimed.length === 0) {
        return null;
    }
    return sTrimed;
};

export const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
