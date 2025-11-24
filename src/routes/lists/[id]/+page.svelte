<script lang="ts">
    import type { PageProps } from "./$types";
    import ItemCard from "$lib/components/wishlists/ItemCard/ItemCard.svelte";
    import ClaimFilterChip from "$lib/components/wishlists/chips/ClaimFilter.svelte";
    import { goto, invalidate } from "$app/navigation";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { quintOut } from "svelte/easing";
    import { crossfade } from "svelte/transition";
    import { isInstalled } from "$lib/stores/is-installed";
    import empty from "$lib/assets/no_wishes.svg";
    import SortBy from "$lib/components/wishlists/chips/SortBy.svelte";
    import { hash, hashItems, viewedItems } from "$lib/stores/viewed-items";
    import { getListViewPreference, initListViewPreference } from "$lib/stores/list-view-preference.svelte";
    import { ListAPI } from "$lib/api/lists";
    import TokenCopy from "$lib/components/TokenCopy.svelte";
    import { dragHandleZone, type DndZoneAttributes, type Item, type Options } from "svelte-dnd-action";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import ReorderChip from "$lib/components/wishlists/chips/ReorderChip.svelte";
    import ManageListChip from "$lib/components/wishlists/chips/ManageListChip.svelte";
    import ListViewModeChip from "$lib/components/wishlists/chips/ListViewModeChip.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { ItemCreateHandler, ItemDeleteHandler, ItemsUpdateHandler, ItemUpdateHandler } from "$lib/events";
    import { getFormatter } from "$lib/i18n";
    import Markdown from "$lib/components/Markdown.svelte";
    import ListStatistics from "$lib/components/wishlists/ListStatistics.svelte";
    import type { ActionReturn } from "svelte/action";

    const { data }: PageProps = $props();
    const t = getFormatter();

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
    let hideDescription = $state(false);

    // Initialize from server data (cookie) to prevent flicker
    // This value comes from the server, so SSR renders the correct view
    initListViewPreference(data.initialViewPreference);
    let isTileView = $derived(getListViewPreference() === "tile");

    const flipDurationMs = 200;
    const listAPI = new ListAPI(data.list.id);
    const toastStore = getToastStore();

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
    });
    onMount(() => {
        const eventSource = subscribeToEvents();
        return () => eventSource.close();
    });

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
                const userHasClaimed = v.claims.find((c) => data.user?.id && c.claimedBy?.id === data.user.id);
                if (v.isClaimable && !userHasClaimed) {
                    g[0].push(v);
                } else {
                    g[1].push(v);
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
        const eventSource = new EventSource(`${page.url.pathname}/events`);
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
        return eventSource;
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

    // custom dnd action to remove the aria disabled flag
    function dndZone<T extends Item>(
        node: HTMLElement,
        options: Options<T>
    ): ActionReturn<Options<T>, DndZoneAttributes<T>> {
        const zone = dragHandleZone(node, options);
        node.setAttribute("aria-disabled", "false");
        return {
            update(newOptions) {
                zone.update?.(newOptions);
                node.setAttribute("aria-disabled", "false");
            },
            destroy: zone.destroy
        };
    }
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

{#if data.list.description}
    <div class="w-full pb-4">
        {#if !hideDescription}
            <Markdown source={data.list.description} />
        {/if}
        <button
            class="text-sm text-primary-700 dark:text-primary-500"
            onclick={() => (hideDescription = !hideDescription)}
        >
            {hideDescription ? $t("wishes.show-description") : $t("wishes.hide-description")}
        </button>
    </div>
{/if}

<!-- chips -->
<div class="flex flex-wrap justify-between gap-2 pb-4">
    <div class="flex flex-row flex-wrap items-center gap-2">
        {#if !data.list.owner.isMe}
            <ClaimFilterChip />
        {/if}
        <SortBy />
    </div>
    <div class="flex flex-row flex-wrap items-center gap-2">
        {#if !reordering}
            <ListViewModeChip {isTileView} />
        {/if}
        {#if data.list.owner.isMe || data.list.isManager}
            <ReorderChip onFinalize={handleReorderFinalize} bind:reordering />
            <ManageListChip onclick={() => goto(`${new URL(page.url).pathname}/manage`)} />
        {/if}
    </div>
</div>

{#if data.list.owner.isMe || data.list.isManager}
    <div class="flex flex-wrap-reverse justify-between gap-2 pb-4">
        <ListStatistics {items} />
        {#if data.listMode === "registry" || data.list.public}
            <div class="flex h-fit flex-row gap-x-2">
                {#if publicListUrl}
                    <div class="flex flex-row">
                        <TokenCopy btnStyle="btn-icon-sm" url={publicListUrl?.href}>
                            {$t("wishes.public-url")}
                        </TokenCopy>
                    </div>
                {:else}
                    <button class="variant-ringed-surface btn btn-sm" onclick={getOrCreatePublicList}>
                        {$t("wishes.share")}
                    </button>
                {/if}
            </div>
        {/if}
    </div>
{/if}

{#if (data.list.owner.isMe || data.list.isManager) && approvals.length > 0}
    <div class="flex flex-col space-y-4 pb-4">
        <h2 class="h2">{$t("wishes.approvals")}</h2>
        <div
            class={isTileView
                ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                : "flex flex-col space-y-4"}
            data-testid="approvals-container"
        >
            {#each approvals as item (item.id)}
                <div in:receive={{ key: item.id }} out:send|local={{ key: item.id }} animate:flip={{ duration: 200 }}>
                    <ItemCard
                        groupId={data.list.groupId}
                        {isTileView}
                        {item}
                        requireClaimEmail={data.requireClaimEmail}
                        showClaimForOwner={data.showClaimForOwner}
                        showClaimedName={data.showClaimedName}
                        user={data.loggedInUser}
                        userCanManage={data.list.isManager}
                    />
                </div>
            {/each}
        </div>
        <hr />
    </div>
{/if}

{#if items.length === 0}
    <div class="flex flex-col items-center justify-center space-y-4 pt-2">
        <img class="w-3/4 md:w-1/3" alt={$t("a11y.two-people-looking-in-an-empty-box")} src={empty} />
        <p class="text-2xl">{$t("wishes.no-wishes-yet")}</p>
    </div>
{:else}
    <!-- items -->
    <div
        class={isTileView
            ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            : "flex flex-col space-y-4"}
        data-testid="items-container"
        onconsider={handleDnd}
        onfinalize={handleDnd}
        use:dndZone={{
            items,
            flipDurationMs,
            dragDisabled: false,
            dropTargetClasses: ["variant-ringed-primary"],
            dropTargetStyle: {}
        }}
    >
        <!-- Workaround for svelte-dnd not playing nicely with transitions -->
        {#if reordering}
            {#each items as item (item.id)}
                <div animate:flip={{ duration: flipDurationMs }}>
                    <ItemCard
                        groupId={data.list.groupId}
                        {isTileView}
                        {item}
                        onDecreasePriority={handleDecreasePriority}
                        onIncreasePriority={handleIncreasePriority}
                        reorderActions
                        requireClaimEmail={data.requireClaimEmail}
                        showClaimForOwner={data.showClaimForOwner}
                        showClaimedName={data.showClaimedName}
                        user={data.loggedInUser}
                        userCanManage={data.list.isManager}
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
                            groupId={data.list.groupId}
                            {isTileView}
                            {item}
                            onPublicList={!data.loggedInUser && data.list.public}
                            requireClaimEmail={data.requireClaimEmail}
                            showClaimForOwner={data.showClaimForOwner}
                            showClaimedName={data.showClaimedName}
                            user={data.loggedInUser}
                            userCanManage={data.list.isManager}
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
        onclick={() => goto(`${page.url.pathname}/create-item?redirectTo=${page.url.pathname}`, { replaceState: true })}
    >
        <iconify-icon height="32" icon="ion:add" width="32"></iconify-icon>
    </button>
{/if}

<svelte:head>
    <title>{listName}</title>
</svelte:head>
