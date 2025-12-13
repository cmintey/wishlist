<script lang="ts">
    import type { PageData, PageProps } from "./$types";
    import { fade } from "svelte/transition";
    import { hash, hashItems, viewedItems } from "$lib/stores/viewed-items";
    import ListCard from "$lib/components/ListCard.svelte";
    import { goto } from "$app/navigation";
    import ListFilterChip from "$lib/components/wishlists/chips/ListFilterChip.svelte";
    import empty from "$lib/assets/no_wishes.svg";
    import { getFormatter } from "$lib/i18n";
    import { resolve } from "$app/paths";
    import Icon from "$lib/components/Icon.svelte";

    type ListData = PageData["otherLists"][0];

    let { data }: PageProps = $props();

    const t = getFormatter();
    const users = $state(data.users);

    const hasNewItems = async (list: ListData) => {
        if (!list.items || list.items.length === 0) return false;
        const userHash = await hash(list.id);
        const currentHash = await hashItems(list.items);
        const viewedHash = $viewedItems[userHash];
        return currentHash !== viewedHash;
    };
</script>

<div class="flex flex-wrap-reverse items-start justify-between gap-2 pb-4">
    <ListFilterChip {users} />
    <button
        class="variant-ghost-secondary btn btn-sm h-fit items-center"
        onclick={() => goto(resolve("/lists/create"))}
    >
        <Icon icon="ion--add"></Icon>
        <span class="text-xs">{$t("wishes.create-list")}</span>
    </button>
</div>

{#if data.myLists.length + data.otherLists.length === 0}
    <div class="flex flex-col items-center justify-center space-y-4 pt-4">
        <img class="w-3/4 md:w-1/3" alt={$t("a11y.two-people-looking-in-an-empty-box")} src={empty} />
        <p class="text-2xl">{$t("wishes.no-lists-yet")}</p>
    </div>
{:else}
    <div class="flex flex-col space-y-4" data-testid="list-container" in:fade>
        {#each data.myLists as list (list.id)}
            <ListCard hideCount {list} />
        {/each}

        {#each data.otherLists as list (list.id)}
            {#await hasNewItems(list)}
                <ListCard {list} />
            {:then hasNewItems}
                <ListCard {hasNewItems} {list} />
            {/await}
        {/each}
    </div>
{/if}

<svelte:head>
    <title>{$t("wishes.lists")}</title>
</svelte:head>
