<script lang="ts">
    import { getFormatter, getLocale } from "$lib/i18n";
    import { ListBox, ListBoxItem, getModalStore } from "@skeletonlabs/skeleton";

    interface Props {
        parent: any;
    }

    const { parent }: Props = $props();
    const t = getFormatter();
    const locale = getLocale();
    const modalStore = getModalStore();
    let selectedGroup: string | undefined = $state();
    let groups: Record<string, string>[] = $modalStore[0] ? $modalStore[0].meta?.groups : [];

    function onFormSubmit(): void {
        if (selectedGroup) {
            if ($modalStore[0]?.response) $modalStore[0].response(selectedGroup);
            modalStore.close();
        }
    }
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
    <header class="text-2xl font-bold">{$t("general.select-group")}</header>
    <ListBox class="border border-surface-500 p-4 rounded-container-token">
        {#each groups.toSorted((a, b) => a.name.localeCompare(b.name, locale)) as group}
            <ListBoxItem name={group.name} value={group.id} bind:group={selectedGroup}>
                {group.name}
            </ListBoxItem>
        {/each}
    </ListBox>

    <footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" onclick={parent.onClose}>
            {parent.buttonTextCancel}
        </button>
        <button class="btn {parent.buttonPositive}" onclick={onFormSubmit}>{$t("general.change-group")}</button>
    </footer>
</div>
