import { getRequestEvent } from "$app/server";
import { t, waitLocale, format } from "svelte-i18n";
import { get } from "svelte/store";

const _f = ($t: typeof t) => get($t);
type MessageFormatter_ = ReturnType<typeof _f>;
type MessageFormatterParams = Parameters<MessageFormatter_>;
export type MessageObject = Exclude<MessageFormatterParams[0], string>;
export type MessageFormatter = Awaited<ReturnType<typeof getFormatter>>;

export async function getFormatter(locale?: string) {
    if (!locale) {
        const evt = getRequestEvent();
        locale = evt.locals.locale;
    }
    await waitLocale(locale);
    return (id: string, options?: Omit<MessageObject, "id">) => {
        let options_: Omit<MessageObject, "id"> = { locale };
        if (options) {
            options_ = { ...options };
        }
        return get(format)(id, options_);
    };
}
