<script lang="ts">
    import { quintOut } from "svelte/easing";
    import { crossfade } from "svelte/transition";
    import { flip } from "svelte/animate";
    import type { PageProps } from "./$types";
    import ItemCard from "$lib/components/wishlists/ItemCard/ItemCard.svelte";
    import noClaims from "$lib/assets/no_claims.svg";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import { getListViewPreference, initListViewPreference } from "$lib/stores/list-view-preference.svelte";
    import ListViewModeChip from "$lib/components/wishlists/chips/ListViewModeChip.svelte";

    const { data }: PageProps = $props();
    const t = getFormatter();

    let items: ItemOnListDTO[] = $state(data.items);

    // Initialize from server data (cookie) to prevent flicker
    // This value comes from the server, so SSR renders the correct view
    initListViewPreference(data.initialViewPreference);
    let isTileView = $derived(getListViewPreference() === "tile");

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

    let sortedItems = $derived.by(() => {
        const unpurchasedItems: ItemOnListDTO[] = [];
        const purchasedItems: ItemOnListDTO[] = [];
        items.forEach((item) => (item.claims[0].purchased ? purchasedItems.push(item) : unpurchasedItems.push(item)));
        return [...unpurchasedItems, ...purchasedItems];
    });
</script>

<!-- View mode toggle -->
<div class="flex flex-wrap justify-start gap-2 pb-4">
    <ListViewModeChip {isTileView} />
</div>

{#if data.items.length === 0}
    <div class="flex flex-col items-center justify-center space-y-4 pt-4">
        <img class="w-3/4 md:w-1/3" alt={$t("a11y.a-person-looking-at-an-empty-board")} src={noClaims} />
        <p class="text-2xl">{$t("wishes.nothing-claimed-yet")}</p>
    </div>
{:else}
    <div
        class={isTileView
            ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            : "flex flex-col space-y-4"}
        data-testid="claims-container"
    >
        {#each sortedItems as item (item.id)}
            <div in:receive={{ key: item.id }} out:send|local={{ key: item.id }} animate:flip={{ duration: 200 }}>
                <ItemCard {isTileView} {item} requireClaimEmail showClaimedName showFor user={data.user} />
            </div>
        {/each}
    </div>
{/if}

<svelte:head>
    <title>{$t("app.my-claims")}</title>
</svelte:head>
