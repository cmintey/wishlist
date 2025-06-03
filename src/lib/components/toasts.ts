import { type ToastStore } from "@skeletonlabs/skeleton";
import { t } from "svelte-i18n";
import { get } from "svelte/store";

export const errorToast = (toastStore: ToastStore, message?: string) => {
    toastStore.trigger({
        message: message || get(t)("general.oops"),
        background: "variant-filled-error",
        autohide: true,
        timeout: 5000
    });
};
