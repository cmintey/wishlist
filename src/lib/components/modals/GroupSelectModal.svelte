<script lang="ts">
    import { getFormatter } from "$lib/i18n";

    interface Props {
        parent: any;
    }

    const { parent }: Props = $props();
    const t = getFormatter();
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
    <ListBox class="border-surface-500 rounded-container border p-4">
        {#each groups as group}
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
