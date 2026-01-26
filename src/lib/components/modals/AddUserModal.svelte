<script lang="ts">
    import { UsersAPI } from "$lib/api/users";
    import { getFormatter } from "$lib/i18n";
    import type { User } from "$lib/generated/prisma/client";
    import BaseModal, { type BaseModalProps as BaseProps } from "./BaseModal.svelte";
    import { GroupAPI } from "$lib/api/groups";
    import { invalidateAll } from "$app/navigation";
    import { debounce } from "$lib/util";
    import { Dialog } from "@skeletonlabs/skeleton-svelte";
    import { Listbox, useListCollection } from "@skeletonlabs/skeleton-svelte";

    interface Props extends Pick<BaseProps, "trigger"> {
        groupId: string;
        excludedUserIds: string[];
    }

    const { groupId, trigger, excludedUserIds }: Props = $props();
    const t = getFormatter();

    const groupAPI = $derived(new GroupAPI(groupId));
    const usersAPI = new UsersAPI();

    function resetForm() {
        searchValue = undefined;
        searchedUsers = [];
        selectedUser = undefined;
    }

    async function onFormSubmit() {
        if (selectedUser) {
            await groupAPI.addMember(selectedUser);
            await invalidateAll();
        }
        resetForm();
    }

    let searchedUsers: User[] = $state([]);
    let selectedUser: string | undefined = $state();
    let searchValue: string | undefined = $state();

    const doSearch = debounce(async (value: string | undefined) => {
        if (value) {
            searchedUsers = await usersAPI
                .search(value, { excludedUserIds })
                .then((resp) => resp.json() as unknown as User[]);
        } else {
            searchedUsers = [];
        }
    });

    const collection = $derived(
        useListCollection({
            items: searchedUsers,
            itemToValue(item) {
                return item.id;
            }
        })
    );
</script>

<BaseModal title={$t("general.add-user")} {trigger}>
    {#snippet description()}
        {$t("general.search-for-user")}
    {/snippet}

    <Listbox {collection} onSelect={(e) => (selectedUser = e.value)}>
        <Listbox.Label class="text-base">{$t("general.search")}</Listbox.Label>
        <Listbox.Input>
            {#snippet element(props)}
                <div class="input-group grid-cols-[auto_1fr]">
                    <div class="ig-cell preset-tonal">
                        <iconify-icon icon="ion:search"></iconify-icon>
                    </div>
                    <input
                        {...props}
                        class="ig-input rounded-l-none ring-0 focus:focus-within:ring-1"
                        oninput={(e) => doSearch(e.currentTarget.value)}
                        type="search"
                        bind:value={searchValue}
                    />
                </div>
            {/snippet}
        </Listbox.Input>
        <Listbox.Content class="preset-filled-surface-200-800 preset-outlined-surface-300-700 pt-1">
            {#if collection.items.length === 0}
                <span class="px-2 pt-1">{$t("general.no-results")}</span>
            {/if}
            {#each collection.items as item (item.id)}
                <Listbox.Item {item}>
                    <Listbox.ItemText>
                        <span>{item.name}</span>
                        <span class="text-xs opacity-50">{item.username}</span>
                    </Listbox.ItemText>
                    <Listbox.ItemIndicator />
                </Listbox.Item>
            {/each}
        </Listbox.Content>
    </Listbox>

    {#snippet actions({ neutralStyle, positiveStyle })}
        <Dialog.CloseTrigger class={neutralStyle} onclick={resetForm}>
            {$t("general.cancel")}
        </Dialog.CloseTrigger>

        <Dialog.CloseTrigger class={positiveStyle} onclick={onFormSubmit}>
            {$t("general.add-user")}
        </Dialog.CloseTrigger>
    {/snippet}
</BaseModal>
