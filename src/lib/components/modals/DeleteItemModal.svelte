<script lang="ts">
    import { refreshAll } from "$app/navigation";

    import { ItemAPI } from "#lib/api/items.js";
    import { ListItemAPI } from "#lib/api/lists.js";

    import type { ItemOnListDTO } from "#lib/dtos/item-dto.js";

    import { getFormatter } from "#lib/i18n.js";
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
    const listItemAPI = $derived(new ListItemAPI(item.list.id, item.id));

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
            refreshAll();

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
            refreshAll();

            toaster.info({ description: $t("wishes.item-was-deleted", { values: { name: itemNameShort } }) });
        } else {
            toaster.error({ description: $t("general.oops") });
        }
    }
</script>

<BaseModal {description} title={$t("general.please-confirm")} {...props}>
    {#snippet actions({ neutralStyle, negativeStyle, positiveStyle })}
        <Dialog.CloseTrigger class={neutralStyle}>
            {$t("general.cancel")}
        </Dialog.CloseTrigger>
        {#if item.listCount > 1}
            <div class="flex flex-wrap gap-2">
                {#if !isOnlyManager}
                    <Dialog.CloseTrigger class={negativeStyle} onclick={onDelete}>
                        {$t("wishes.all-lists")}
                    </Dialog.CloseTrigger>
                {/if}
                <Dialog.CloseTrigger class={positiveStyle} onclick={onRemove}>
                    {$t("wishes.this-list")}
                </Dialog.CloseTrigger>
            </div>
        {:else}
            <Dialog.CloseTrigger class={positiveStyle} onclick={onDelete}>
                {$t("general.confirm")}
            </Dialog.CloseTrigger>
        {/if}
    {/snippet}
</BaseModal>
