<script lang="ts">
    import type { PageData } from "./$types";
    import ItemCard from "$lib/components/wishlists/ItemCard/ItemCard.svelte";
    import ClaimFilterChip from "$lib/components/wishlists/chips/ClaimFilter.svelte";
    import { goto, invalidate } from "$app/navigation";
    import { page } from "$app/state";
    import { onDestroy, onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { quintOut } from "svelte/easing";
    import { crossfade } from "svelte/transition";
    import { isInstalled } from "$lib/stores/is-installed";
    import empty from "$lib/assets/no_wishes.svg";
    import SortBy from "$lib/components/wishlists/chips/SortBy.svelte";
    import { hash, hashItems, viewedItems } from "$lib/stores/viewed-items";
    import { ListAPI } from "$lib/api/lists";
    import TokenCopy from "$lib/components/TokenCopy.svelte";
    import { dragHandleZone } from "svelte-dnd-action";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import ReorderChip from "$lib/components/wishlists/chips/ReorderChip.svelte";
    import { t } from "svelte-i18n";
    import ManageListChip from "$lib/components/wishlists/chips/ManageListChip.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { ItemCreateHandler, ItemDeleteHandler, ItemsUpdateHandler, ItemUpdateHandler } from "$lib/events";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    let allItems: ItemOnListDTO[] = $state(data.list.items);
    let reordering = $state(false);
    let publicListUrl: URL | undefined = $state();
    let approvals = $derived(allItems.filter((item) => !item.approved));
    let items = $derived(allItems.filter((item) => item.approved));
    let listName = $derived.by(() => {
        if (data.list.name) {
            return data.list.name;
        } else if (data.list.owner.isMe) {
            return $t("wishes.my-wishes");
        } else {
            return $t("wishes.wishes-for", { values: { listOwner: data.list.owner.name } });
        }
    });

    const flipDurationMs = 200;
    const listAPI = new ListAPI(data.list.id);
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

    $effect(() => {
        allItems = data.list.items;
    });

    const groupItems = (items: ItemOnListDTO[]) => {
        // When on own list, don't separate out claimed vs un-claimed
        if (data.list.owner.isMe) {
            return [items, []];
        }
        return items.reduce(
            (g, v) => {
                if (v.claims.length > 0) {
                    g[1].push(v);
                } else {
                    g[0].push(v);
                }
                return g;
            },
            [[], []] as ItemOnListDTO[][]
        );
    };

    const updateHash = async () => {
        const userHash = await hash(data.list.id);
        $viewedItems[userHash] = await hashItems(allItems);
    };

    const subscribeToEvents = () => {
        eventSource = new EventSource(`${page.url.pathname}/events`);
        ItemUpdateHandler.listen(eventSource, (data) => {
            updateItem(data);
            updateHash();
        });
        ItemCreateHandler.listen(eventSource, (data) => {
            addItem(data);
            updateHash();
        });
        ItemDeleteHandler.listen(eventSource, (data) => {
            removeItem(data);
            updateHash();
        });
        ItemsUpdateHandler.listen(eventSource, () => {
            if (!data.list.owner.isMe) {
                invalidate("data:items");
                updateHash();
            }
        });
    };

    const updateItem = (updatedItem: ItemOnListDTO) => {
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

    const removeItem = (removedItem: { id: number }) => {
        allItems = allItems.filter((item) => item.id !== removedItem.id);
    };

    const addItem = (addedItem: ItemOnListDTO) => {
        if (!(addedItem.approved || data.list.owner.isMe)) {
            return;
        }
        allItems = [...allItems, addedItem];
    };

    const getOrCreatePublicList = async () => {
        if (!data.list.public) {
            const listApi = new ListAPI(data.list.id);
            const resp = await listApi.makePublic();
            if (!resp.ok) {
                const message = await resp.text();
                toastStore.trigger({
                    message,
                    background: "variant-filled-error"
                });
                return;
            }
        }
        publicListUrl = new URL(`/lists/${data.list.id}`, window.location as unknown as URL);
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
            itemId: item.id,
            displayOrder: idx
        }));
        const response = await listAPI.updateItems(displayOrderUpdate);
        if (!response.ok) {
            toastStore.trigger({
                message: $t("wishes.unable-to-update-item-ordering"),
                background: "variant-filled-error"
            });
            allItems = data.list.items;
        }
    };
</script>

<!-- chips -->
<div class="flex justify-between">
    <div class="flex flex-row flex-wrap space-x-4">
        {#if !data.list.owner.isMe}
            <ClaimFilterChip />
        {/if}
        <SortBy />
    </div>
    {#if data.list.owner.isMe}
        <div class="flex flex-row flex-wrap space-x-4">
            <ReorderChip onFinalize={handleReorderFinalize} bind:reordering />
            <ManageListChip onclick={() => goto(`${new URL(page.url).pathname}/manage`)} />
        </div>
    {/if}
</div>

{#if data.list.owner.isMe && (data.listMode === "registry" || data.list.public)}
    <div class="flex flex-row space-x-2 pb-4">
        {#if publicListUrl}
            <div class="flex flex-row">
                <TokenCopy btnStyle="btn-icon-sm" url={publicListUrl?.href}>{$t("wishes.public-url")}</TokenCopy>
            </div>
        {:else}
            <button class="variant-ringed-surface btn btn-sm" onclick={getOrCreatePublicList}>
                {$t("wishes.share")}
            </button>
        {/if}
    </div>
{/if}

{#if data.list.owner.isMe && approvals.length > 0}
    <div class="flex flex-col space-y-4 pb-4">
        <h2 class="h2">{$t("wishes.approvals")}</h2>
        <div class="flex flex-col space-y-4">
            {#each approvals as item (item.id)}
                <div in:receive={{ key: item.id }} out:send|local={{ key: item.id }} animate:flip={{ duration: 200 }}>
                    <ItemCard {item} showClaimedName={data.showClaimedName} requireClaimEmail={data.requireClaimEmail} user={data.list.owner} />
                </div>
            {/each}
        </div>
        <hr />
    </div>
{/if}

{#if items.length === 0}
    <div class="flex flex-col items-center justify-center space-y-4 pt-4">
        <img class="w-3/4 md:w-1/3" alt={$t("a11y.two-people-looking-in-an-empty-box")} src={empty} />
        <p class="text-2xl">{$t("wishes.no-wishes-yet")}</p>
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
                        requireClaimEmail={data.requireClaimEmail}
                        user={data.loggedInUser}
                    />
                </div>
            {/each}
        {:else}
            {#each groupItems(items) as groupedItems}
                {#each groupedItems as item (item.id)}
                    <div
                        in:receive={{ key: item.id }}
                        out:send|local={{ key: item.id }}
                        animate:flip={{ duration: flipDurationMs }}
                    >
                        <ItemCard
                            {item}
                            onPublicList={!data.loggedInUser && data.list.public}
                            showClaimedName={data.showClaimedName}
                            requireClaimEmail={data.requireClaimEmail}
                            user={data.loggedInUser}
                        />
                    </div>
                {/each}
            {/each}
        {/if}
    </div>

    <!-- spacer -->
    <footer>
        <div class="h-16"></div>
    </footer>
{/if}

<!-- Add Item button -->
{#if data.loggedInUser && (data.list.owner.isMe || data.suggestionsEnabled)}
    <button
        class="z-90 variant-ghost-surface btn fixed right-4 h-16 w-16 rounded-full md:bottom-10 md:right-10 md:h-20 md:w-20"
        class:bottom-24={$isInstalled}
        class:bottom-4={!$isInstalled}
        aria-label="add item"
        onclick={() => goto(`${page.url.pathname}/create-item?redirectTo=${page.url.pathname}`)}
    >
        <iconify-icon height="32" icon="ion:add" width="32"></iconify-icon>
    </button>
{/if}

<svelte:head>
    <title>{listName}</title>
</svelte:head>
