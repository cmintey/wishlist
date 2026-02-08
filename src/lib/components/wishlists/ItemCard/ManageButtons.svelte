<script lang="ts">
    import type { InternalItemCardProps } from "./ItemCard.svelte";
    import { getFormatter } from "$lib/i18n";
    import ConfirmModal from "$lib/components/modals/ConfirmModal.svelte";
    import DeleteItemModal from "$lib/components/modals/DeleteItemModal.svelte";
    import { ListItemAPI } from "$lib/api/lists";
    import { toaster } from "$lib/components/toaster";
    import { resolve } from "$app/paths";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    interface Props extends Pick<InternalItemCardProps, "item" | "user" | "userCanManage"> {
        onEdit?: VoidFunction;
    }

    const { item, user, userCanManage, onEdit }: Props = $props();
    const t = getFormatter();
    const listItemAPI = $derived(new ListItemAPI(item.listId, item.id));

    let isOnlyManager = $derived(
        (user?.id !== item.user?.id && user?.id !== item.addedBy?.id && userCanManage) || false
    );
    let itemNameShort = $derived(item.name.length > 42 ? item.name.substring(0, 42) + "…" : item.name);

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

    const handleEdit = () => {
        onEdit?.();
        goto(resolve("/items/[itemId]/edit", { itemId: item.id.toString() }) + `?redirectTo=${page.url.pathname}`, {
            replaceState: true
        });
    };
</script>

{#snippet approvalButton(approve: boolean)}
    <ConfirmModal onConfirm={() => handleApproval(approve)}>
        {#snippet description()}
            {@html $t("wishes.approval-confirmation", { values: { name: item.addedBy?.name, approve } })}
        {/snippet}
        {#snippet trigger(props)}
            <button
                {...props}
                class={["btn btn-sm md:btn-md", approve ? "preset-filled-success-500" : "preset-filled-error-500"]}
                aria-label={approve ? $t("wishes.approve") : $t("wishes.deny")}
                onclick={(e) => {
                    e.stopPropagation();
                    props.onclick?.(e);
                }}
                title={approve ? $t("wishes.approve") : $t("wishes.deny")}
            >
                {approve ? $t("wishes.approve") : $t("wishes.deny")}
                <iconify-icon icon={approve ? "ion:checkmark" : "ion:close"}></iconify-icon>
            </button>
        {/snippet}
    </ConfirmModal>
{/snippet}

{#snippet deleteButton()}
    <DeleteItemModal {isOnlyManager} {item} {itemNameShort}>
        {#snippet trigger(props)}
            <button
                {...props}
                class="preset-filled-error-500 btn btn-icon btn-icon-sm md:btn-icon-base"
                aria-label={$t("wishes.delete")}
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
{/snippet}

<div class="flex flex-row flex-wrap gap-2">
    {#if !item.approved}
        {@render approvalButton(true)}
        {@render approvalButton(false)}
    {:else if user?.id === item.user?.id || user?.id === item.addedBy?.id}
        <button
            class="preset-tonal-primary inset-ring-primary-500 btn btn-icon btn-icon-sm md:btn-icon-base inset-ring"
            aria-label={$t("wishes.edit")}
            onclick={(e) => {
                e.stopPropagation();
                handleEdit();
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
