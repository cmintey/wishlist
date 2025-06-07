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

export const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) => groupByAndMap(arr, key, (a) => a);

export const groupByAndMap = <T, K extends keyof any, M>(arr: T[], key: (i: T) => K, mapper: (t: T) => M) =>
    arr.reduce(
        (groups, item) => {
            (groups[key(item)] ||= []).push(mapper(item));
            return groups;
        },
        {} as Record<K, M[]>
    );
