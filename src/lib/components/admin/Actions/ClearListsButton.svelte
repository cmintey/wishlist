<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { ItemsAPI } from "$lib/api/items";
    import ConfirmModal from "$lib/components/modals/ConfirmModal.svelte";
    import { toaster } from "$lib/components/toaster";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        groupId?: string | undefined;
        claimed?: boolean;
    }

    const { groupId = undefined, claimed = false }: Props = $props();
    const t = getFormatter();

    const itemsAPI = new ItemsAPI();

    let description = $derived(
        $t("admin.clear-lists-confirmation", {
            values: { claimedOnly: claimed, groupSpecific: groupId !== undefined }
        })
    );

    const onConfirm = async () => {
        const resp = await itemsAPI.clearItemsFromLists(groupId, claimed);

        if (resp.ok) {
            invalidateAll();

            toaster.info({ description: $t("general.wishlists-cleared") });
        } else {
            toaster.error({ description: $t("general.oops") });
        }
    };
</script>

<ConfirmModal {description} {onConfirm} title={$t("general.please-confirm")}>
    {#snippet trigger(props)}
        <button class="preset-filled-error-500 btn w-fit" {...props} type="button">
            {$t("admin.clear-lists", { values: { claimedOnly: claimed, groupSpecific: groupId !== undefined } })}
        </button>
    {/snippet}
</ConfirmModal>
