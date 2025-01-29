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

export const groupBy = <T, K>(xs: T[], keyFn: (x: T) => K): Map<K, T[]> => {
    return xs.reduce((group, x) => {
        const key = keyFn(x);
        if (group.get(key)) {
            group.get(key)?.push(x);
        } else {
            group.set(key, [x]);
        }
        return group;
    }, new Map<K, T[]>());
};
