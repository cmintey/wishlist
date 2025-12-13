<script lang="ts">
    import { UsersAPI } from "$lib/api/users";
    import { getFormatter } from "$lib/i18n";
    import type { User } from "@prisma/client";
    import { ListBox, ListBoxItem, getModalStore } from "@skeletonlabs/skeleton";
    import Icon from "../Icon.svelte";

    interface Props {
        parent: any;
    }

    const { parent }: Props = $props();
    const t = getFormatter();

    const modalStore = getModalStore();
    let selectedUser: string | undefined = $state();

    function onFormSubmit(): void {
        if (selectedUser) {
            if ($modalStore[0].response) $modalStore[0].response(selectedUser);
            modalStore.close();
        }
    }

    const usersAPI = new UsersAPI();

    let users: User[] = $state([]);
    const doSearch = async (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        const resp = await usersAPI.search(e.currentTarget.value);
        users = await resp.json();
    };
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
    <header class="text-2xl font-bold">{$t("general.add-user")}</header>
    <span>{$t("general.search-for-user")}</span>
    <label class="w-fit">
        <span>{$t("general.search")}</span>
        <div class="input-group grid-cols-[auto_1fr_auto]">
            <div class="input-group-shim">
                <Icon class="text-lg" icon="ion--search"></Icon>
            </div>
            <input class="input" oninput={doSearch} type="search" />
        </div>
    </label>

    {#if users.length > 0}
        <ListBox class="border border-surface-500 p-4 rounded-container-token">
            {#each users as user}
                <ListBoxItem name="user" value={user.id} bind:group={selectedUser}>
                    <div class="flex items-baseline gap-2">
                        <span>{user.name}</span>
                        <span class="subtext">{user.username}</span>
                    </div>
                </ListBoxItem>
            {/each}
        </ListBox>
    {/if}

    <footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" onclick={parent.onClose}>
            {parent.buttonTextCancel}
        </button>
        <button class="btn {parent.buttonPositive}" onclick={onFormSubmit}>{$t("general.add-user")}</button>
    </footer>
</div>
