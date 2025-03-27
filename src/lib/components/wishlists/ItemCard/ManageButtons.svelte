<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import { t } from "svelte-i18n";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";

    interface Props {
        item: ItemOnListDTO;
        user: PartialUser | undefined;
        onApprove?: VoidFunction;
        onDeny?: VoidFunction;
        onDelete?: VoidFunction;
        onEdit?: VoidFunction;
    }

    let { item, user, ...props }: Props = $props();
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
            class="variant-ghost-primary btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                props.onEdit?.();
            }}
        >
            {$t("wishes.edit")}
        </button>
        <button
            class="variant-filled-error btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                props.onDelete?.();
            }}
        >
            {$t("wishes.delete")}
        </button>
    {/if}
</div>
