<script lang="ts">
    import { UsersAPI } from "$lib/api/users";
    import { getFormatter } from "$lib/i18n";
    import type { User } from "$lib/generated/prisma/client";
    import BaseModal, { type BaseModalProps as BaseProps } from "./BaseModal.svelte";
    import { GroupAPI } from "$lib/api/groups";
    import { invalidateAll } from "$app/navigation";
    import { debounce } from "$lib/util";
    import { Dialog } from "@skeletonlabs/skeleton-svelte";

    interface Props extends Pick<BaseProps, "trigger"> {
        groupId: string;
    }

    const { groupId, trigger }: Props = $props();
    const t = getFormatter();

    const groupAPI = $derived(new GroupAPI(groupId));
    const usersAPI = new UsersAPI();

    let open = $state(false);

    function resetForm() {
        searchValue = undefined;
        selectedUser = undefined;
    }

    async function onFormSubmit() {
        if (selectedUser) {
            await groupAPI.addMember(selectedUser);
            await invalidateAll();
        }
    }

    let selectedUser: string | undefined = $state();
    let searchValue: string | undefined = $state();

    // let users: User[] = $state([]);
    const doSearch = debounce(async (value: string | undefined) => {
        if (value) {
            return await usersAPI.search(value).then((resp) => resp.json() as unknown as User[]);
        }
        return [];
    });

    $effect(() => {
        if (!open) {
            resetForm();
        }
    });
</script>

<BaseModal title={$t("general.add-user")} {trigger}>
    {#snippet description()}
        {$t("general.search-for-user")}
    {/snippet}

    <label class="w-fit">
        <span>{$t("general.search")}</span>
        <div class="input-group grid-cols-[auto_1fr_auto]">
            <div class="ig-cell preset-tonal">
                <iconify-icon class="text-lg" icon="ion:search"></iconify-icon>
            </div>
            <input class="ig-input" type="search" bind:value={searchValue} />
        </div>
    </label>

    {#await doSearch(searchValue) then users}
        {#if users.length > 0}
            <ListBox class="border-surface-500 rounded-container border p-4">
                {#each users as user}
                    <ListBoxItem name={user.name} value={user.id} bind:group={selectedUser}>
                        <span>{user.name}</span>
                        <span class="subtext">{user.username}</span>
                    </ListBoxItem>
                {/each}
            </ListBox>
        {/if}
    {/await}

    {#snippet actions()}
        <div class="flex justify-between">
            <Dialog.CloseTrigger class="preset-tonal-surface border-surface-500 btn btn-sm md:btn-md border">
                {$t("general.cancel")}
            </Dialog.CloseTrigger>

            <Dialog.CloseTrigger class="preset-filled btn btn-sm md:btn-md" onclick={onFormSubmit}>
                {$t("general.add-user")}
            </Dialog.CloseTrigger>
        </div>
    {/snippet}
</BaseModal>
