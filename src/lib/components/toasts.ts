import { getFormatter } from "$lib/i18n";
import { type ToastStore } from "@skeletonlabs/skeleton";
import { get } from "svelte/store";

export const errorToast = (toastStore: ToastStore, message?: string) => {
    const t = getFormatter();
    toastStore.trigger({
        message: message || get(t)("general.oops"),
        background: "variant-filled-error",
        autohide: true,
        timeout: 5000
    });
};
