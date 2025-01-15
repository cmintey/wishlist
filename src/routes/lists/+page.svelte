<script lang="ts">
    import type { PageData } from "./$types";
    import { fade } from "svelte/transition";
    import { hash, hashItems, viewedItems } from "$lib/stores/viewed-items";
    import { t } from "svelte-i18n";
    import ListCard from "$lib/components/ListCard.svelte";
    import { isInstalled } from "$lib/stores/is-installed";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    interface Props {
        data: PageData;
    }
    type ListData = PageData["otherLists"][0];

    let { data }: Props = $props();

    const hasNewItems = async (list: ListData) => {
        if (!list.items || list.items.length === 0) return false;
        const userHash = await hash(list.id);
        const currentHash = await hashItems(list.items);
        const viewedHash = $viewedItems[userHash];
        return currentHash !== viewedHash;
    };
</script>

<div class="flex flex-col space-y-4" in:fade>
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

<button
    class="z-90 variant-ghost-surface btn fixed right-4 h-16 w-16 rounded-full md:bottom-10 md:right-10 md:h-20 md:w-20"
    class:bottom-24={$isInstalled}
    class:bottom-4={!$isInstalled}
    aria-label="add item"
    onclick={() => goto(`${page.url.pathname}/create`)}
>
    <iconify-icon height="32" icon="ion:add" width="32"></iconify-icon>
</button>

<svelte:head>
    <title>{$t("wishes.lists")}</title>
</svelte:head>
