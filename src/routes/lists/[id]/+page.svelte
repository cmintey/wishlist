<script lang="ts">
    import ItemCard from "$lib/components/wishlists/ItemCard/ItemCard.svelte";
    import empty from "$lib/assets/no_wishes.svg";
    import { flip } from "svelte/animate";
    import { quintOut } from "svelte/easing";
    import { crossfade } from "svelte/transition";
    import type { PageData } from "./$types";
    import SortBy from "$lib/components/wishlists/chips/SortBy.svelte";
    import ClaimFilterChip from "$lib/components/wishlists/chips/ClaimFilter.svelte";
    import { page } from "$app/stores";
    import { SSEvents } from "$lib/schema";
    import { onMount, onDestroy } from "svelte";
    import { t } from "svelte-i18n";

    interface Props {
        data: PageData;
    }
    type Item = PageData["list"]["items"][0];

    let { data }: Props = $props();
    let allItems = $state(data.list.items);
    let items = $derived(allItems.filter((item) => item.approved));

    const [send, receive] = crossfade({
        duration: (d) => Math.sqrt(d * 200),

        fallback(node) {
            const style = getComputedStyle(node);
            const transform = style.transform === "none" ? "" : style.transform;

            return {
                duration: 600,
                easing: quintOut,
                css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
            };
        }
    });

    let eventSource: EventSource;
    onMount(async () => {
        subscribeToEvents();
    });
    onDestroy(() => eventSource?.close());

    $effect(() => {
        allItems = data.list.items;
    });

    const subscribeToEvents = () => {
        eventSource = new EventSource(`${$page.url.pathname}/events`);
        eventSource.addEventListener(SSEvents.item.update, (e) => {
            const message = JSON.parse(e.data) as Item;
            updateItems(message);
        });
        eventSource.addEventListener(SSEvents.item.delete, (e) => {
            const message = JSON.parse(e.data) as Item;
            removeItem(message);
        });
        eventSource.addEventListener(SSEvents.item.create, (e) => {
            const message = JSON.parse(e.data) as Item;
            addItem(message);
        });
    };

    const updateItems = (updatedItem: Item) => {
        // for when an item gets approved
        if (!allItems.find((item) => item.id === updatedItem.id)) {
            addItem(updatedItem);
        }
        allItems = allItems.map((item) => {
            if (item.id === updatedItem.id) {
                return { ...item, ...updatedItem };
            }
            return item;
        });
    };

    const removeItem = (removedItem: Item) => {
        allItems = allItems.filter((item) => item.id !== removedItem.id);
    };

    const addItem = (addedItem: Item) => {
        allItems = [...allItems, addedItem];
    };
</script>

<h1 class="h1 pb-2 md:pb-4">{$t("wishes.wishes-for", { values: { listOwner: data.list.owner.name } })}</h1>

<!-- chips -->
<div class="flex flex-row flex-wrap space-x-4">
    <ClaimFilterChip />
    <SortBy />
</div>

{#if items.length === 0}
    <div class="flex flex-col items-center justify-center space-y-4 pt-4">
        <img class="w-3/4 md:w-1/3" alt={$t("a11y.two-people-looking-in-an-empty-box")} src={empty} />
        <p class="text-2xl">{$t("wishes.no-wishes-yet")}</p>
    </div>
{:else}
    <!-- items -->
    <div class="flex flex-col space-y-4">
        <!-- unclaimed-->
        {#each items.filter((item) => !item.pledgedById) as item (item.id)}
            <div in:receive={{ key: item.id }} out:send|local={{ key: item.id }} animate:flip={{ duration: 200 }}>
                <ItemCard {item} onPublicList />
            </div>
        {/each}
        <!-- claimed -->
        {#each items.filter((item) => item.pledgedById) as item (item.id)}
            <div in:receive={{ key: item.id }} out:send|local={{ key: item.id }} animate:flip={{ duration: 200 }}>
                <ItemCard {item} onPublicList />
            </div>
        {/each}
    </div>

    <!-- spacer -->
    <footer>
        <div class="h-16"></div>
    </footer>
{/if}

<svelte:head>
    <title>{$t("wishes.wishes-for", { values: { listOwner: data.list.owner.name } })}</title>
</svelte:head>
