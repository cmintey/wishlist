import { env } from "$env/dynamic/public";
import type { ItemPrice } from "@prisma/client";

type ItemWithPrice = {
    price?: string | null;
    itemPrice?: ItemPrice | null;
};

const getMaximumFractionDigits = (currency: string) => {
    return getFormatter(currency).resolvedOptions().maximumFractionDigits || 2;
};

export const getFormatter = (currency: string | null, locale: string | undefined = undefined) => {
    return Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency || env.PUBLIC_DEFAULT_CURRENCY,
        currencyDisplay: "narrowSymbol"
    });
};

export const formatPrice = (item: ItemWithPrice, locale: string | undefined = undefined) => {
    if (!item.itemPrice) {
        return item.price;
    }

    const formatter = getFormatter(item.itemPrice.currency, locale);
    const maxFracDigits = getMaximumFractionDigits(item.itemPrice.currency);

    const value = item.itemPrice.value / Math.pow(10, maxFracDigits);
    return formatter.format(value);
};

export const formatNumberAsPrice = (price: number, locale: string | undefined = undefined) => {
    return getFormatter(null, locale).format(price);
};

export const getPriceValue = (item: ItemWithPrice) => {
    if (!item.itemPrice) {
        return 0;
    }
    const maxFracDigits = getMaximumFractionDigits(item.itemPrice.currency);
    return item.itemPrice.value / Math.pow(10, maxFracDigits);
};

export const getMinorUnits = (value: number, currency: string) => {
    const maxFracDigits = getMaximumFractionDigits(currency);
    return value * Math.pow(10, maxFracDigits);
};
