<script lang="ts">
    import { UsersAPI } from "$lib/api/users";
    import { getFormatter } from "$lib/i18n";
    import type { User } from "$lib/generated/prisma/client";
    import BaseModal, { type BaseModalProps } from "./BaseModal.svelte";
    import { Dialog, Listbox, useListCollection } from "@skeletonlabs/skeleton-svelte";
    import { debounce } from "$lib/util";

    interface Props {
        trigger: BaseModalProps["trigger"];
        groupId: string;
        managers: Pick<User, "id">[];
        onSubmit?: (value: Pick<User, "id" | "name" | "email" | "username">) => void;
    }

    const { trigger, groupId, managers, onSubmit }: Props = $props();
    const t = getFormatter();

    const searchOptions = $derived({
        groupId,
        excludedUserIds: managers.map(({ id }) => id)
    });

    let searchValue: string | undefined = $state();
    let selectedUser: string | undefined = $state();
    let users: Pick<User, "id" | "name" | "email" | "username">[] = $state([]);

    function resetForm() {
        searchValue = undefined;
        users = [];
        selectedUser = undefined;
    }

    function onFormSubmit(): void {
        if (selectedUser && selectedUser !== "") {
            onSubmit?.(users.find(({ id }) => id === selectedUser)!);
        }
        resetForm();
    }

    const usersAPI = new UsersAPI();

    const doSearch = debounce(async (value: string | undefined) => {
        if (value) {
            users = await usersAPI.search(value, searchOptions).then((resp) => resp.json() as unknown as User[]);
        } else {
            users = [];
        }
    });

    const collection = $derived(
        useListCollection({
            items: users,
            itemToValue(item) {
                return item.id;
            }
        })
    );
</script>

<BaseModal title={$t("wishes.add-a-list-manager")} {trigger}>
    {#snippet description()}
        <p>{$t("wishes.add-a-list-manager-explainer")}</p>
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
            {$t("wishes.add-a-manager")}
        </Dialog.CloseTrigger>
    {/snippet}
</BaseModal>
