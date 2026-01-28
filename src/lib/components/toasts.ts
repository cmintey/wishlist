import { type ToastStore } from "@skeletonlabs/skeleton";

export const errorToast = (toastStore: ToastStore, message: string) => {
    toastStore.trigger({
        message,
        background: "variant-filled-error",
        autohide: true,
        timeout: 5000
    });
};

export const successToast = (toastStore: ToastStore, message: string) => {
    toastStore.trigger({
        message,
        background: "variant-filled-success",
        autohide: true,
        timeout: 3000
    });
};
