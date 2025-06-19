import { type ToastStore } from "@skeletonlabs/skeleton";

export const errorToast = (toastStore: ToastStore, message: string) => {
    toastStore.trigger({
        message,
        background: "variant-filled-error",
        autohide: true,
        timeout: 5000
    });
};
