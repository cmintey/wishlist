<script lang="ts">
    import { ListBox, ListBoxItem, getModalStore } from "@skeletonlabs/skeleton";
    import { t } from "svelte-i18n";

    interface Props {
        parent: any;
    }

    let { parent }: Props = $props();
    const modalStore = getModalStore();

    // passed in via meta
    let groups: Record<string, string>[] = $modalStore[0] ? $modalStore[0].meta?.groups : [];
    let defaultGroup: Record<string, string> = $modalStore[0] ? $modalStore[0].meta?.defaultGroup : undefined;
    let smtpEnabled: boolean = $modalStore[0] ? $modalStore[0].meta?.smtpEnabled : false;

    let userEmail: string | undefined = $state();
    let selectedGroup: string | undefined = $state(defaultGroup?.id || undefined);

    function onFormSubmit(): void {
        if (selectedGroup) {
            if ($modalStore[0].response)
                $modalStore[0].response({
                    group: selectedGroup,
                    email: userEmail
                });
            modalStore.close();
        }
    }
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
    <header class="text-2xl font-bold">{$t("general.invite-user")}</header>

    {#if smtpEnabled}
        <span>{$t("general.enter-user-email")}</span>
    {:else}
        <span>{$t("general.select-user-group")}</span>
    {/if}

    {#if smtpEnabled}
        <label class="w-fit" for="invite-email">
            <span>{$t("auth.email")}</span>
            <input
                id="invite-email"
                name="invite-email"
                class="input"
                autocomplete="off"
                required
                type="email"
                bind:value={userEmail}
            />
        </label>
    {/if}

    {#if groups && groups.length > 0}
        <label for="group">{$t("general.group")}</label>
        <ListBox id="group" class="border border-surface-500 p-4 rounded-container-token">
            {#each groups as group}
                <ListBoxItem name={group.name} value={group.id} bind:group={selectedGroup}>
                    {group.name}
                </ListBoxItem>
            {/each}
        </ListBox>
    {/if}

    <footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" onclick={parent.onClose}>
            {parent.buttonTextCancel}
        </button>
        <button class="btn {parent.buttonPositive}" onclick={onFormSubmit}>{$t("general.invite")}</button>
    </footer>
</div>
