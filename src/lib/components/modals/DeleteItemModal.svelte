<script lang="ts">
    import { invalidateAll } from "$app/navigation";

    import { ItemAPI } from "$lib/api/items";
    import { ListItemAPI } from "$lib/api/lists";

    import type { ItemOnListDTO } from "$lib/dtos/item-dto";

    import { getFormatter } from "$lib/i18n";
    import { Dialog } from "@skeletonlabs/skeleton-svelte";
    import { toaster } from "../toaster";
    import BaseModal, { type BaseModalProps } from "./BaseModal.svelte";

    interface Props extends Omit<BaseModalProps, "title" | "description" | "children" | "element" | "actions"> {
        item: ItemOnListDTO;
        itemNameShort: string;
        isOnlyManager: boolean;
    }

    const { item, itemNameShort, isOnlyManager, ...props }: Props = $props();

    const t = getFormatter();
    const itemAPI = $derived(new ItemAPI(item.id));
    const listItemAPI = $derived(new ListItemAPI(item.listId, item.id));

    let description = $derived(
        $t(
            item.listCount > 1
                ? "wishes.are-you-sure-you-wish-to-delete-item-multiple-lists"
                : "wishes.are-you-sure-you-wish-to-delete-item",
            { values: { name: itemNameShort } }
        )
    );

    async function onRemove() {
        const resp = await listItemAPI.delete();

        if (resp.ok) {
            invalidateAll();

            toaster.info({
                description: $t("wishes.item-was-removed-from-list", { values: { name: itemNameShort } })
            });
        } else {
            toaster.error({ description: $t("general.oops") });
        }
    }

    async function onDelete() {
        const resp = await itemAPI.delete();

        if (resp.ok) {
            invalidateAll();

            toaster.info({ description: $t("wishes.item-was-deleted", { values: { name: itemNameShort } }) });
        } else {
            toaster.error({ description: $t("general.oops") });
        }
    }
</script>

<BaseModal {description} title={$t("general.please-confirm")} {...props}>
    {#snippet actions()}
        <footer class="flex flex-wrap justify-between gap-y-2">
            <Dialog.CloseTrigger class="preset-tonal-surface border-surface-500 btn btn-sm md:btn-md border">
                {$t("general.cancel")}
            </Dialog.CloseTrigger>
            {#if item.listCount > 1}
                <div class="flex flex-wrap gap-2">
                    {#if !isOnlyManager}
                        <Dialog.CloseTrigger class="preset-filled-error-500 btn btn-sm md:btn-md" onclick={onDelete}>
                            {$t("wishes.all-lists")}
                        </Dialog.CloseTrigger>
                    {/if}
                    <Dialog.CloseTrigger class="preset-filled-primary-500 btn btn-sm md:btn-md" onclick={onRemove}>
                        {$t("wishes.this-list")}
                    </Dialog.CloseTrigger>
                </div>
            {:else}
                <Dialog.CloseTrigger class="preset-filled btn btn-sm md:btn-md" onclick={onDelete}>
                    {$t("general.confirm")}
                </Dialog.CloseTrigger>
            {/if}
        </footer>
    {/snippet}
</BaseModal>
