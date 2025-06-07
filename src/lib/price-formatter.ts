import { env } from "$env/dynamic/public";
import type { ItemPrice } from "@prisma/client";
import { getNumberFormatter } from "svelte-i18n";
import { getLocale } from "./i18n";

type ItemWithPrice = {
    price?: string | null;
    itemPrice?: ItemPrice | null;
};

export type LocaleConfig = {
    currencySymbol: string;
    groupSeparator: string;
    decimalSeparator: string;
    prefix: string;
    suffix: string;
};

const getMaximumFractionDigits = (currency: string) => {
    return getFormatter(currency).resolvedOptions().maximumFractionDigits || 2;
};

export const getFormatter = (currency: string | null) => {
    return getNumberFormatter({
        locale: getLocale(),
        style: "currency",
        currency: currency || env.PUBLIC_DEFAULT_CURRENCY,
        currencyDisplay: "narrowSymbol"
    });
};

export const formatPrice = (item: ItemWithPrice) => {
    if (!item.itemPrice) {
        return item.price;
    }

    return formatNumberAsPrice(item.itemPrice.currency, item.itemPrice.value);
};

export const formatNumberAsPrice = (currency: string, price: number) => {
    const formatter = getFormatter(currency);
    const maxFracDigits = getMaximumFractionDigits(currency);

    const value = price / Math.pow(10, maxFracDigits);
    return formatter.format(value);
};

export const getPriceValue = (item: ItemWithPrice) => {
    if (!item.itemPrice) {
        return null;
    }
    const maxFracDigits = getMaximumFractionDigits(item.itemPrice.currency);
    return item.itemPrice.value / Math.pow(10, maxFracDigits);
};

export const getMinorUnits = (value: number, currency: string) => {
    const maxFracDigits = getMaximumFractionDigits(currency);
    return value * Math.pow(10, maxFracDigits);
};

const defaultConfig: LocaleConfig = {
    currencySymbol: "",
    groupSeparator: "",
    decimalSeparator: "",
    prefix: "",
    suffix: ""
};

export const getLocaleConfig = (formatter: Intl.NumberFormat) => {
    return formatter.formatToParts(1000.1).reduce((prev, curr, i): LocaleConfig => {
        if (curr.type === "currency") {
            if (i === 0) {
                return { ...prev, currencySymbol: curr.value, prefix: curr.value };
            } else {
                return { ...prev, currencySymbol: curr.value, suffix: curr.value };
            }
        }
        if (curr.type === "group") {
            return { ...prev, groupSeparator: curr.value };
        }
        if (curr.type === "decimal") {
            return { ...prev, decimalSeparator: curr.value };
        }

        return prev;
    }, defaultConfig);
};
