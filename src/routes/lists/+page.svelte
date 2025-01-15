<script lang="ts">
    import type { PageData } from "./$types";
    import { fade } from "svelte/transition";
    import { hash, hashItems, viewedItems } from "$lib/stores/viewed-items";
    import { t } from "svelte-i18n";
    import ListCard from "$lib/components/ListCard.svelte";

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

<svelte:head>
    <title>{$t("wishes.lists")}</title>
</svelte:head>
