<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { melt } from "@melt-ui/svelte";
    import BaseModal from "./BaseModal.svelte";
    import type { Props as BaseProps } from "./BaseModal.svelte";

    interface Props extends Omit<BaseProps, "title" | "body" | "actions"> {
        title?: string;
        actions?: BaseProps["actions"];
        onConfirm?: VoidFunction;
        onCancel?: VoidFunction;
    }

    const t = getFormatter();

    const {
        title = $t("general.please-confirm"),
        actions: _actions,
        onConfirm,
        onCancel,
        role = "alertdialog",
        ...rest
    }: Props = $props();
</script>

<BaseModal {role} {title} {...rest}>
    {#snippet actions(action)}
        {#if _actions}
            {@render _actions(action)}
        {:else}
            <div class="flex justify-between">
                <button class="variant-ghost-surface btn btn-sm md:btn-md" onclick={onCancel} use:melt={action}>
                    {$t("general.cancel")}
                </button>
                <button class="variant-filled btn btn-sm md:btn-md" onclick={onConfirm} use:melt={action}>
                    {$t("general.confirm")}
                </button>
            </div>
        {/if}
    {/snippet}
</BaseModal>
