<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import type { Group } from "@prisma/client";
    import BaseModal, { type BaseModalProps } from "./BaseModal.svelte";
    import { Dialog } from "@skeletonlabs/skeleton-svelte";

    interface Props extends Omit<BaseModalProps, "title" | "description" | "actions" | "children"> {
        groups: Group[];
        onSubmit: (groupId: string | undefined) => void;
    }

    const { groups, onSubmit, ...props }: Props = $props();
    const t = getFormatter();
    let selectedGroup: string | undefined = $state();

    function onFormSubmit() {
        onSubmit(selectedGroup);
    }
</script>

<BaseModal title={$t("general.select-group")} {...props}>
    {#snippet description()}{/snippet}

    <ListBox class="border-surface-500 rounded-container border p-4">
        {#each groups as group}
            <ListBoxItem name={group.name} value={group.id} bind:group={selectedGroup}>
                {group.name}
            </ListBoxItem>
        {/each}
    </ListBox>

    {#snippet actions()}
        <div class="flex justify-between">
            <Dialog.CloseTrigger class="variant-ghost-surface btn btn-sm md:btn-md">
                {$t("general.cancel")}
            </Dialog.CloseTrigger>

            <Dialog.CloseTrigger class="variant-filled btn btn-sm md:btn-md" onclick={onFormSubmit}>
                {$t("general.change-group")}
            </Dialog.CloseTrigger>
        </div>
    {/snippet}
</BaseModal>
