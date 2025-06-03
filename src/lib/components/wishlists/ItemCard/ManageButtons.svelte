<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        item: ItemOnListDTO;
        user: PartialUser | undefined;
        onApprove?: VoidFunction;
        onDeny?: VoidFunction;
        onDelete?: VoidFunction;
        onEdit?: VoidFunction;
    }

    const { item, user, ...props }: Props = $props();
    const t = getFormatter();
</script>

<div class="flex flex-row space-x-2 md:space-x-4">
    {#if !item.approved}
        <button
            class="variant-filled-success btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                props.onApprove?.();
            }}
        >
            {$t("wishes.approve")}
        </button>
        <button
            class="variant-filled-error btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                props.onDeny?.();
            }}
        >
            {$t("wishes.deny")}
        </button>
    {:else if user?.id === item.user?.id || user?.id === item.addedBy?.id}
        <button
            class="variant-ghost-primary btn btn-icon btn-icon-sm md:btn-icon-base"
            aria-label={$t("wishes.edit")}
            onclick={(e) => {
                e.stopPropagation();
                props.onEdit?.();
            }}
            title={$t("wishes.edit")}
        >
            <span><iconify-icon icon="ion:edit"></iconify-icon></span>
        </button>
        <button
            class="variant-filled-error btn btn-icon btn-icon-sm md:btn-icon-base"
            aria-label={$t("wishes.delete")}
            onclick={(e) => {
                e.stopPropagation();
                props.onDelete?.();
            }}
            title={$t("wishes.delete")}
        >
            <span><iconify-icon icon="ion:trash"></iconify-icon></span>
        </button>
    {/if}
</div>
