<script lang="ts">
    import { getFormatter, getLocale } from "$lib/i18n";
    import type { Group } from "$lib/generated/prisma/client";
    import BaseModal, { type BaseModalProps } from "./BaseModal.svelte";
    import { Dialog, Listbox, useListCollection } from "@skeletonlabs/skeleton-svelte";

    interface Props extends Omit<BaseModalProps, "title" | "description" | "actions" | "children"> {
        groups: Group[];
        onSubmit: (groupId: string | undefined) => void;
    }

    const { groups, onSubmit, ...props }: Props = $props();
    const t = getFormatter();
    const locale = getLocale();
    let selectedGroup: string | undefined = $state();

    function onFormSubmit() {
        onSubmit(selectedGroup);
    }

    const collection = useListCollection({
        items: groups.toSorted((a, b) => a.name.localeCompare(b.name, locale)),
        itemToString: (item) => item.name,
        itemToValue: (item) => item.id
    });
</script>

<BaseModal title={$t("general.select-group")} {...props}>
    {#snippet description()}
        <Listbox {collection}>
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

    {#snippet actions()}
        <div class="flex flex-wrap justify-between gap-2">
            <Dialog.CloseTrigger class="preset-tonal-surface border-surface-500 btn btn-sm md:btn-md border">
                {$t("general.cancel")}
            </Dialog.CloseTrigger>

            <Dialog.CloseTrigger class="preset-filled btn btn-sm md:btn-md" onclick={onFormSubmit}>
                {$t("general.change-group")}
            </Dialog.CloseTrigger>
        </div>
    {/snippet}
</BaseModal>
