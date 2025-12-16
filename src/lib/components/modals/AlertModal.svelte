<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { Dialog } from "@skeletonlabs/skeleton-svelte";
    import BaseModal from "./BaseModal.svelte";
    import type { BaseModalProps as BaseProps } from "./BaseModal.svelte";

    interface Props extends Omit<BaseProps, "actions"> {
        onConfirm?: VoidFunction;
        confirmText?: string;
    }

    const t = getFormatter();

    const { onConfirm, confirmText = $t("general.ok"), ...rest }: Props = $props();
</script>

<BaseModal {...rest}>
    {#snippet actions()}
        <div class="flex justify-end">
            <Dialog.CloseTrigger class="preset-filled btn btn-sm md:btn-md" onclick={onConfirm}>
                {confirmText}
            </Dialog.CloseTrigger>
        </div>
    {/snippet}
</BaseModal>
