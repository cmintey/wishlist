<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import ConfirmModal from "$lib/components/modals/ConfirmModal.svelte";
    import DeleteItemModal from "$lib/components/modals/DeleteItemModal.svelte";
    import { ListItemAPI } from "$lib/api/lists";
    import { toaster } from "$lib/components/toaster";

    interface Props {
        item: ItemOnListDTO;
        user: PartialUser | undefined;
        itemNameShort: string;
        onEdit?: VoidFunction;
    }

    const { item, user, itemNameShort, ...props }: Props = $props();
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

{#snippet approvalButton(approve: boolean)}
    <ConfirmModal onConfirm={() => handleApproval(approve)}>
        {#snippet description()}
            {@html $t("wishes.approval-confirmation", { values: { name: item.addedBy?.name, approve } })}
        {/snippet}
        {#snippet trigger(props)}
            <button
                class={["btn btn-sm md:btn-md", approve ? "preset-filled-success-500" : "preset-filled-error-500"]}
                {...props}
                onclick={(e) => {
                    e.stopPropagation();
                    props.onclick?.(e);
                }}
            >
                {approve ? $t("wishes.approve") : $t("wishes.deny")}
            </button>
        {/snippet}
    </ConfirmModal>
{/snippet}

<div class="flex flex-row gap-x-2 md:gap-x-4">
    {#if !item.approved}
        {@render approvalButton(true)}
        {@render approvalButton(false)}
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
        <DeleteItemModal {item} {itemNameShort}>
            {#snippet trigger(props)}
                <button
                    class="preset-filled-error-500 btn btn-icon btn-icon-sm md:btn-icon-base"
                    aria-label={$t("wishes.delete")}
                    {...props}
                    onclick={(e) => {
                        e.stopPropagation();
                        props.onclick?.(e);
                    }}
                    title={$t("wishes.delete")}
                >
                    <iconify-icon icon="ion:trash"></iconify-icon>
                </button>
            {/snippet}
        </DeleteItemModal>
    {/if}
</div>
