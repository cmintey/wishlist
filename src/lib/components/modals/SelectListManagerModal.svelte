<script lang="ts">
    import { UsersAPI } from "$lib/api/users";
    import { getFormatter } from "$lib/i18n";
    import type { User } from "@prisma/client";
    import { ListBox, ListBoxItem, getModalStore } from "@skeletonlabs/skeleton";

    interface Props {
        parent: any;
    }

    interface Meta {
        groupId: string;
        managers: Pick<User, "id">[];
    }

    const { parent }: Props = $props();
    const t = getFormatter();

    const modalStore = getModalStore();
    const { groupId, managers }: Meta = $modalStore[0].meta;

    const searchOptions = {
        groupId,
        excludedUserIds: managers.map(({ id }) => id)
    };

    let selectedUser: string | undefined = $state();

    function onFormSubmit(): void {
        if (selectedUser && selectedUser !== "") {
            if ($modalStore[0].response) $modalStore[0].response(users.find(({ id }) => id === selectedUser));
            modalStore.close();
        }
    }

    const usersAPI = new UsersAPI();

    let users: Pick<User, "id" | "name" | "email">[] = $state([]);
    const doSearch = async (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        const resp = await usersAPI.search(e.currentTarget.value, searchOptions);
        users = await resp.json();
    };
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
    <header class="text-2xl font-bold">{$t("wishes.add-a-list-manager")}</header>
    <p>{$t("wishes.add-a-list-manager-explainer")}</p>
    <label class="w-fit">
        <span>{$t("general.search")}</span>
        <div class="input-group grid-cols-[auto_1fr_auto]">
            <div class="input-group-shim">
                <iconify-icon class="text-lg" icon="ion:search"></iconify-icon>
            </div>
            <input class="input" oninput={doSearch} type="search" />
        </div>
    </label>

    {#if users.length > 0}
        <ListBox class="border border-surface-500 p-4 rounded-container-token">
            {#each users as user}
                <ListBoxItem name={user.name} value={user.id} bind:group={selectedUser}>
                    {user.name}
                </ListBoxItem>
            {/each}
        </ListBox>
    {/if}

    <footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" onclick={modalStore.close}>{$t("general.cancel")}</button>
        <button class="btn {parent.buttonPositive}" onclick={onFormSubmit}>{$t("wishes.add-a-manager")}</button>
    </footer>
</div>
