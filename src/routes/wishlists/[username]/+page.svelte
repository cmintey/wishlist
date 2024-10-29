<script lang="ts">
    import type { PageData } from "./$types";
    import ItemCard from "$lib/components/wishlists/ItemCard/ItemCard.svelte";
    import ClaimFilterChip from "$lib/components/wishlists/chips/ClaimFilter.svelte";
    import { goto, invalidate } from "$app/navigation";
    import { page } from "$app/stores";
    import { onDestroy, onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { quintOut } from "svelte/easing";
    import { crossfade } from "svelte/transition";
    import { isInstalled } from "$lib/stores/is-installed";
    import empty from "$lib/assets/no_wishes.svg";
    import SortBy from "$lib/components/wishlists/chips/SortBy.svelte";
    import { hash, hashItems, viewedItems } from "$lib/stores/viewed-items";
    import { SSEvents } from "$lib/schema";
    import { PublicListAPI } from "$lib/api/lists";
    import TokenCopy from "$lib/components/TokenCopy.svelte";
    import { dragHandleZone } from "svelte-dnd-action";
    import { ItemsAPI } from "$lib/api/items";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import ReorderChip from "$lib/components/wishlists/chips/ReorderChip.svelte";

    interface Props {
        data: PageData;
    }
    type Item = PageData["items"][0];

    let { data }: Props = $props();

    let allItems = $state(data.items);
    let reordering = $state(false);
    let publicListUrl: URL | undefined = $state();

    let approvals = $derived(allItems.filter((item) => !item.approved));
    let items = $derived(allItems.filter((item) => item.approved));

    const flipDurationMs = 200;
    const itemsAPI = new ItemsAPI();
    const toastStore = getToastStore();
    let eventSource: EventSource;

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

    onMount(async () => {
        await updateHash();
        subscribeToEvents();
    });
    onDestroy(() => eventSource?.close());

    const updateHash = async () => {
        const userHash = await hash(data.listOwner.id + data.groupId);
        $viewedItems[userHash] = await hashItems(allItems);
    };

    const subscribeToEvents = () => {
        eventSource = new EventSource(`${$page.url.pathname}/events`);
        eventSource.addEventListener(SSEvents.item.update, (e) => {
            const message = JSON.parse(e.data) as Item;
            updateItem(message);
            updateHash();
        });
        eventSource.addEventListener(SSEvents.item.delete, (e) => {
            const message = JSON.parse(e.data) as Item;
            removeItem(message);
            updateHash();
        });
        eventSource.addEventListener(SSEvents.item.create, (e) => {
            const message = JSON.parse(e.data) as Item;
            addItem(message);
            updateHash();
        });
        eventSource.addEventListener(SSEvents.items.update, () => {
            if (!data.listOwner.isMe) {
                invalidate("data:items");
                updateHash();
            }
        });
    };

    const updateItem = (updatedItem: Item) => {
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
        if (!(addedItem.approved || data.listOwner.isMe)) {
            return;
        }
        allItems = [...allItems, addedItem];
    };

    const getOrCreatePublicList = async () => {
        let publicListId = "";
        const publicListApi = new PublicListAPI(data.groupId);
        const resp = await publicListApi.get();
        if (resp.ok) {
            publicListId = (await resp.json()).id;
        } else {
            const createResp = await publicListApi.create();
            if (createResp.ok) {
                publicListId = (await createResp.json()).id;
            }
        }
        publicListUrl = new URL(`/lists/${publicListId}`, window.location as unknown as URL);
    };

    const handleDnd = (e: CustomEvent) => {
        allItems = e.detail.items;
    };
    const swap = <T,>(arr: T[], a: number, b: number) => {
        return arr.with(a, arr[b]).with(b, arr[a]);
    };
    const handleIncreasePriority = (itemId: number) => {
        const itemIdx = allItems.findIndex((item) => item.id === itemId);
        if (itemIdx > 0) {
            allItems = swap(allItems, itemIdx, itemIdx - 1);
        }
    };
    const handleDecreasePriority = (itemId: number) => {
        const itemIdx = allItems.findIndex((item) => item.id === itemId);
        if (itemIdx < allItems.length - 1) {
            allItems = swap(allItems, itemIdx, itemIdx + 1);
        }
    };
    const handleReorderFinalize = async () => {
        reordering = false;
        const displayOrderUpdate = allItems.map((item, idx) => ({
            id: item.id,
            displayOrder: idx
        }));
        const response = await itemsAPI.updateMany(displayOrderUpdate);
        if (!response.ok) {
            toastStore.trigger({
                message: "Unable to update item ordering",
                background: "variant-filled-error"
            });
            allItems = data.items;
        }
    };
</script>

<!-- chips -->
{#if allItems.length > 0}
    <div class="flex justify-between">
        <div class="flex flex-row flex-wrap space-x-4">
            {#if !data.listOwner.isMe}
                <ClaimFilterChip />
            {/if}
            <SortBy />
        </div>
        {#if data.listOwner.isMe}
            <ReorderChip onFinalize={handleReorderFinalize} bind:reordering />
        {/if}
    </div>
{/if}

{#if data.listMode === "registry"}
    <div class="flex flex-row space-x-2 pb-4">
        {#if publicListUrl}
            <div class="flex flex-row">
                <TokenCopy btnStyle="btn-icon-sm" url={publicListUrl?.href}>Public URL</TokenCopy>
            </div>
        {:else}
            <button class="variant-ringed-surface btn btn-sm" onclick={getOrCreatePublicList}>Share List</button>
        {/if}
    </div>
{/if}

{#if approvals.length > 0}
    <h2 class="h2 pb-2">Approvals</h2>
    <div class="flex flex-col space-y-4 pb-2">
        {#each approvals as item (item.id)}
            <div in:receive={{ key: item.id }} out:send|local={{ key: item.id }} animate:flip={{ duration: 200 }}>
                <ItemCard {item} showClaimedName={data.showClaimedName} user={data.user} />
            </div>
        {/each}
    </div>
    <hr class="pb-2" />
{/if}

{#if items.length === 0}
    <div class="flex flex-col items-center justify-center space-y-4 pt-4">
        <img class="w-3/4 md:w-1/3" alt="Two people looking in an empty box" src={empty} />
        <p class="text-2xl">No wishes yet</p>
    </div>
{:else}
    <!-- items -->
    <div
        class="flex flex-col space-y-4 p-1 rounded-container-token"
        onconsider={handleDnd}
        onfinalize={handleDnd}
        use:dragHandleZone={{
            items,
            flipDurationMs,
            dragDisabled: !reordering,
            dropTargetClasses: ["variant-ringed-primary"],
            dropTargetStyle: {}
        }}
    >
        {#if data.listOwner.isMe}
            <!-- Workaround for svelte-dnd not playing nicely with transitions -->
            {#if reordering}
                {#each items as item (item.id)}
                    <div animate:flip={{ duration: flipDurationMs }}>
                        <ItemCard
                            {item}
                            onDecreasePriority={handleDecreasePriority}
                            onIncreasePriority={handleIncreasePriority}
                            reorderActions
                            showClaimedName={data.showClaimedName}
                            user={data.user}
                        />
                    </div>
                {/each}
            {:else}
                {#each items as item (item.id)}
                    <div
                        in:receive={{ key: item.id }}
                        out:send|local={{ key: item.id }}
                        animate:flip={{ duration: flipDurationMs }}
                    >
                        <ItemCard {item} showClaimedName={data.showClaimedName} user={data.user} />
                    </div>
                {/each}
            {/if}
        {:else}
            <!-- unclaimed-->
            {#each items.filter((item) => !item.pledgedById) as item (item.id)}
                <div
                    in:receive={{ key: item.id }}
                    out:send|local={{ key: item.id }}
                    animate:flip={{ duration: flipDurationMs }}
                >
                    <ItemCard {item} showClaimedName={data.showClaimedName} user={data.user} />
                </div>
            {/each}
            <!-- claimed -->
            {#each items.filter((item) => item.pledgedById) as item (item.id)}
                <div
                    in:receive={{ key: item.id }}
                    out:send|local={{ key: item.id }}
                    animate:flip={{ duration: flipDurationMs }}
                >
                    <ItemCard {item} showClaimedName={data.showClaimedName} user={data.user} />
                </div>
            {/each}
        {/if}
    </div>

    <!-- spacer -->
    <footer>
        <div class="h-16"></div>
    </footer>
{/if}

<!-- Add Item button -->
{#if data.listOwner.isMe || data.suggestionsEnabled}
    <button
        class="z-90 variant-ghost-surface btn fixed right-4 h-16 w-16 rounded-full md:bottom-10 md:right-10 md:h-20 md:w-20"
        class:bottom-24={$isInstalled}
        class:bottom-4={!$isInstalled}
        aria-label="add item"
        onclick={() => goto(`${$page.url}/new`)}
    >
        <iconify-icon height="32" icon="ion:add" width="32"></iconify-icon>
    </button>
{/if}

<svelte:head>
    <title>{data.listOwner.isMe ? "My" : `${data.listOwner.name}'s`} Wishes</title>
</svelte:head>
