<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import BaseModal from "./BaseModal.svelte";
    import type { Props as BaseProps } from "./BaseModal.svelte";
    import { Dialog, mergeProps } from "bits-ui";

    interface Props extends Omit<BaseProps, "body" | "actions"> {
        onConfirm?: VoidFunction;
        confirmText?: string;
    }

    const t = getFormatter();

    const { onConfirm, confirmText = $t("general.ok"), ...rest }: Props = $props();
</script>

<BaseModal {...rest}>
    {#snippet actions()}
        <div class="flex justify-end">
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
