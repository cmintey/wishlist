<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        item: ItemOnListDTO;
        user: PartialUser | undefined;
        userCanManage: boolean;
        onApprove?: VoidFunction;
        onDeny?: VoidFunction;
        onDelete?: VoidFunction;
        onEdit?: VoidFunction;
    }

    const { item, user, userCanManage, ...props }: Props = $props();
    const t = getFormatter();
</script>

{#snippet deleteButton()}
    <button
        class="variant-filled-error btn btn-icon btn-icon-sm md:btn-icon-base"
        aria-label={$t("wishes.delete")}
        onclick={(e) => {
            e.stopPropagation();
            props.onDelete?.();
        }}
        title={$t("wishes.delete")}
    >
        <iconify-icon icon="ion:trash"></iconify-icon>
    </button>
{/snippet}

<div class="flex flex-row flex-wrap gap-2">
    {#if !item.approved}
        <button
            class="variant-filled-error btn-icon btn-icon-sm md:btn-icon-base"
            aria-label={$t("wishes.deny")}
            onclick={(e) => {
                e.stopPropagation();
                props.onDeny?.();
            }}
            title={$t("wishes.deny")}
        >
            <iconify-icon icon="ion:close"></iconify-icon>
        </button>
        <button
            class="variant-filled-success btn-icon btn-icon-sm md:btn-icon-base"
            aria-label={$t("wishes.approve")}
            onclick={(e) => {
                e.stopPropagation();
                props.onApprove?.();
            }}
            title={$t("wishes.approve")}
        >
            <iconify-icon icon="ion:checkmark"></iconify-icon>
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
            <iconify-icon icon="ion:edit"></iconify-icon>
        </button>
        {@render deleteButton()}
    {:else if userCanManage}
        {@render deleteButton()}
    {/if}
</div>
