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

<div class="flex flex-row gap-x-2 md:gap-x-4">
    {#if !item.approved}
        <button
            class="preset-filled-success-500 btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                props.onApprove?.();
            }}
        >
            {$t("wishes.approve")}
        </button>
        <button
            class="preset-filled-error-500 btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                props.onDeny?.();
            }}
        >
            {$t("wishes.deny")}
        </button>
    {:else if user?.id === item.user?.id || user?.id === item.addedBy?.id}
        <button
            class="preset-tonal-primary border-primary-500 btn btn-icon btn-icon-sm md:btn-icon-base border"
            aria-label={$t("wishes.edit")}
            onclick={(e) => {
                e.stopPropagation();
                props.onEdit?.();
            }}
            title={$t("wishes.edit")}
        >
            <iconify-icon icon="ion:edit"></iconify-icon>
        </button>
        <button
            class="preset-filled-error-500 btn btn-icon btn-icon-sm md:btn-icon-base"
            aria-label={$t("wishes.delete")}
            onclick={(e) => {
                e.stopPropagation();
                props.onDelete?.();
            }}
            title={$t("wishes.delete")}
        >
            <iconify-icon icon="ion:trash"></iconify-icon>
        </button>
    {/if}
</div>
