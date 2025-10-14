import { type ToastStore } from "@skeletonlabs/skeleton-svelte";

export const errorToast = (toastStore: ToastStore, message: string) => {
    toastStore.trigger({
        message,
        background: "preset-filled-error-500",
        autohide: true,
        timeout: 5000
    });
};
