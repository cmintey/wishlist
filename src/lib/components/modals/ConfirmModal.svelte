<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { Dialog, mergeProps } from "bits-ui";
    import BaseModal from "./BaseModal.svelte";
    import type { Props as BaseProps } from "./BaseModal.svelte";

    interface Props extends Omit<BaseProps, "title" | "body" | "actions"> {
        title?: string;
        onConfirm?: VoidFunction;
        onCancel?: VoidFunction;
        cancelText?: string;
        confirmText?: string;
    }

    const t = getFormatter();

    const {
        title = $t("general.please-confirm"),
        onConfirm,
        onCancel,
        confirmText = $t("general.confirm"),
        cancelText = $t("general.cancel"),
        ...rest
    }: Props = $props();
</script>

<BaseModal {title} {...rest}>
    {#snippet actions()}
        <div class="flex justify-between">
            <Dialog.Close>
                {#snippet child({ props })}
                    <button
                        class="variant-ghost-surface btn btn-sm md:btn-md"
                        {...mergeProps({ onclick: onCancel }, props)}
                    >
                        {cancelText}
                    </button>
                {/snippet}
            </Dialog.Close>

            <Dialog.Close>
                {#snippet child({ props })}
                    <button class="variant-filled btn btn-sm md:btn-md" {...mergeProps({ onclick: onConfirm }, props)}>
                        {confirmText}
                    </button>
                {/snippet}
            </Dialog.Close>
        </div>
    {/snippet}
</BaseModal>
