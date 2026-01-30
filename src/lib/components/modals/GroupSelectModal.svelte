<script lang="ts">
    import { getFormatter, getLocale } from "$lib/i18n";
    import type { Group } from "$lib/generated/prisma/client";
    import BaseModal, { type BaseModalProps } from "./BaseModal.svelte";
    import { Dialog, Listbox, useListCollection } from "@skeletonlabs/skeleton-svelte";

    interface Props extends Omit<BaseModalProps, "title" | "description" | "actions" | "children"> {
        groups: Group[];
        onSubmit: (groupId: string | undefined) => void | Promise<void>;
    }

    const { groups, onSubmit, ...props }: Props = $props();
    const t = getFormatter();
    const locale = getLocale();
    let selectedGroup: string[] | undefined = $state();

    function resetForm() {
        selectedGroup = [];
    }

    async function onFormSubmit() {
        await onSubmit(selectedGroup?.[0]);
        resetForm();
    }

    const collection = $derived(
        useListCollection({
            items: groups.toSorted((a, b) => a.name.localeCompare(b.name, locale)),
            itemToString: (item) => item.name,
            itemToValue: (item) => item.id
        })
    );
</script>

<BaseModal title={$t("general.select-group")} {...props}>
    {#snippet description()}
        <Listbox {collection} deselectable onValueChange={(e) => (selectedGroup = e.value)} value={selectedGroup}>
            <Listbox.Label>{$t("admin.select-a-group-option")}</Listbox.Label>
            <Listbox.Content>
                {#each collection.items as item (item.id)}
                    <Listbox.Item {item}>
                        <Listbox.ItemText>{item.name}</Listbox.ItemText>
                        <Listbox.ItemIndicator />
                    </Listbox.Item>
                {/each}
            </Listbox.Content>
        </Listbox>
    {/snippet}

    {#snippet actions({ neutralStyle, positiveStyle })}
        <Dialog.CloseTrigger class={neutralStyle} onclick={resetForm}>
            {$t("general.cancel")}
        </Dialog.CloseTrigger>

        <Dialog.CloseTrigger class={positiveStyle} onclick={onFormSubmit}>
            {$t("general.change-group")}
        </Dialog.CloseTrigger>
    {/snippet}
</BaseModal>
