<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { flip } from "svelte/animate";
    import type { PageProps } from "./$types";
    import ItemCard from "$lib/components/wishlists/ItemCard/ItemCard.svelte";
    import noClaims from "$lib/assets/no_claims.svg";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import { getListViewPreference, initListViewPreference } from "$lib/stores/list-view-preference.svelte";
    import ListViewModeChip from "$lib/components/wishlists/chips/ListViewModeChip.svelte";
    import ListFilterChip from "$lib/components/wishlists/chips/ListFilterChip.svelte";
    import ClaimsGroupBy from "$lib/components/wishlists/chips/ClaimsGroupBy.svelte";

    const { data }: PageProps = $props();
    const t = getFormatter();

    let items: ItemOnListDTO[] = $state(data.items);

    $effect(() => {
        items = data.items;
    });

    // Initialize from server data (cookie) to prevent flicker
    // This value comes from the server, so SSR renders the correct view
    initListViewPreference(data.initialViewPreference);
    let isTileView = $derived(getListViewPreference() === "tile");

    let groupBy = $state("purchased");

    let groupedItems = $derived.by(() => {
        let groupedItems: Record<string, ItemOnListDTO[]> = { _default: items };
        if (groupBy === "purchased") {
            groupedItems = Object.groupBy(items, (it) => (it.claims[0].purchased ? "Purchased" : "_default"));
        } else if (groupBy === "user") {
            groupedItems = items.reduce(
                (accum, item) => {
                    (accum[item.user.name] ??= []).push(item);
                    return accum;
                },
                {} as Record<string, ItemOnListDTO[]>
            );
        }
        return Object.entries(groupedItems).toSorted(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB));
    });

    const isPurchased = (item: ItemOnListDTO) => {
        return item.claims[0].purchased ? 1 : 0;
    };

    let users = $derived(items.map((item) => item.user));
</script>

<!-- View mode toggle -->
<div class="flex flex-wrap items-end justify-between gap-2 pb-4">
    <div class="flex items-end gap-2">
        <ListFilterChip {users} />
        <ClaimsGroupBy bind:groupBy />
    </div>
    <ListViewModeChip {isTileView} />
</div>

<div class="">
    <div class="chip preset-tonal-primary inset-ring-primary-500 inset-ring">Test</div>
    <div class="chip preset-outlined-primary-500">Test</div>
</div>

{#if data.items.length === 0}
    <div class="flex flex-col items-center justify-center space-y-4 pt-4">
        <img class="w-3/4 md:w-1/3" alt={$t("a11y.a-person-looking-at-an-empty-board")} src={noClaims} />
        <p class="text-2xl">{$t("wishes.nothing-claimed-yet")}</p>
    </div>
{:else}
    <div class="flex flex-col space-y-4" data-testid="claims-container">
        {#each groupedItems as [category, items] (category)}
            {@const sortedItems =
                groupBy !== "purchased" ? items.toSorted((a, b) => isPurchased(a) - isPurchased(b)) : items}
            {#if category !== "_default"}
                <span transition:fade>{category}</span>
            {/if}
            <div
                class={[
                    isTileView
                        ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                        : "flex flex-col space-y-4"
                ]}
                data-testid="category"
                transition:scale
            >
                {#each sortedItems as item (item.id)}
                    <div transition:fade animate:flip={{ duration: 200 }}>
                        <ItemCard
                            groupId={data.user.activeGroupId}
                            {isTileView}
                            {item}
                            requireClaimEmail
                            showClaimedName
                            showFor
                            user={data.user}
                        />
                    </div>
                {/each}
            </div>
        {/each}
    </div>
{/if}

<svelte:head>
    <title>{$t("app.my-claims")}</title>
</svelte:head>
