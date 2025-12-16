<script lang="ts">
    import type { InternalItemCardProps } from "./ItemCard.svelte";
    import { getFormatter } from "$lib/i18n";
    import ConfirmModal from "$lib/components/modals/ConfirmModal.svelte";
    import DeleteItemModal from "$lib/components/modals/DeleteItemModal.svelte";
    import { ListItemAPI } from "$lib/api/lists";
    import { toaster } from "$lib/components/toaster";

    interface Props extends Pick<InternalItemCardProps, "item" | "user" | "userCanManage" | "onDelete" | "onEdit"> {
        onApprove?: VoidFunction;
        onDeny?: VoidFunction;
    }

    const { item, user, userCanManage, ...props }: Props = $props();
    const t = getFormatter();
    const listItemAPI = $derived(new ListItemAPI(item.listId, item.id));

    const handleApproval = async (approve: boolean) => {
        const resp = await (approve ? listItemAPI.approve() : listItemAPI.deny());

        if (resp.ok) {
            toaster.info({
                description: $t("wishes.item-approved", { values: { name: itemNameShort, approved: approve } })
            });
        } else {
            toaster.error({ description: $t("general.oops") });
        }
    };
</script>

{#snippet deleteButton()}
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
{/snippet}

<div class="flex flex-row flex-wrap gap-2">
    {#if !item.approved}
        <button
            class="preset-filled-error-500 btn-icon btn-icon-sm md:btn-icon-base"
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
            class="preset-filled-success-500 btn-icon btn-icon-sm md:btn-icon-base"
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
        {@render deleteButton()}
    {:else if userCanManage}
        {@render deleteButton()}
    {/if}
</div>
