<script lang="ts" module>
    export interface ConfirmModalProps extends Omit<BaseProps, "title" | "actions"> {
        title?: string;
        onConfirm?: VoidFunction;
        onCancel?: VoidFunction;
        cancelText?: string;
        confirmText?: string;
        cancelButtonProps?: HTMLButtonAttributes;
        confirmButtonProps?: HTMLButtonAttributes;
    }
</script>

<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { Dialog } from "@skeletonlabs/skeleton-svelte";
    import BaseModal from "./BaseModal.svelte";
    import type { BaseModalProps as BaseProps } from "./BaseModal.svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    const t = getFormatter();

    const {
        title = $t("general.please-confirm"),
        onConfirm,
        onCancel,
        confirmText = $t("general.confirm"),
        cancelText = $t("general.cancel"),
        confirmButtonProps,
        cancelButtonProps,
        ...rest
    }: ConfirmModalProps = $props();
</script>

<BaseModal {title} {...rest}>
    {#snippet actions()}
        <div class="flex justify-between">
            <Dialog.CloseTrigger
                class="preset-tonal btn btn-sm md:btn-base inset-ring"
                onclick={onCancel}
                {...cancelButtonProps}
            >
                {cancelText}
            </Dialog.CloseTrigger>

            <Dialog.CloseTrigger
                class="preset-filled btn btn-sm md:btn-base"
                onclick={onConfirm}
                {...confirmButtonProps}
            >
                {confirmText}
            </Dialog.CloseTrigger>
        </div>
    {/snippet}
</BaseModal>
