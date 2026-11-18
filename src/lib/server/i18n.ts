import { getRequestEvent } from "$app/server";
import { defaultLang } from "$lib/i18n";
import { t, waitLocale, format } from "svelte-i18n";
import { get } from "svelte/store";

const _f = ($t: typeof t) => get($t);
type MessageFormatter_ = ReturnType<typeof _f>;
type MessageFormatterParams = Parameters<MessageFormatter_>;
export type MessageObject = Exclude<MessageFormatterParams[0], string>;
export type MessageFormatter = Awaited<ReturnType<typeof getFormatter>>;

export async function getFormatter(locale?: string) {
    if (!locale) {
        locale = getLocale();
    }
    await waitLocale(locale);
    return (id: string, options?: Omit<MessageObject, "id">) => {
        // Keep the requested locale: spreading options over it dropped the
        // locale, so any message with values fell back to the request's language
        return get(format)(id, { locale, ...options });
    };
}

export function getLocale() {
    return getRequestEvent().locals.locale || defaultLang.code;
}
