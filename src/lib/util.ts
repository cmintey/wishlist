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

export function debounce<T extends unknown[], U>(callback: (...args: T) => PromiseLike<U> | U, wait = 300) {
    let timer: ReturnType<typeof setTimeout> | undefined;

    return (...args: T): Promise<U> => {
        if (timer) clearTimeout(timer);

        return new Promise((resolve) => {
            timer = setTimeout(() => resolve(callback(...args)), wait);
        });
    };
}
