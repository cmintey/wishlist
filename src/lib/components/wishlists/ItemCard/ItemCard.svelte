<script lang="ts" module>
    export interface PartialUser extends Pick<User, "id" | "name"> {
        activeGroupId: string;
    }
</script>

<script lang="ts">
    import type { User } from "@prisma/client";
    import ClaimButtons from "./ClaimButtons.svelte";
    import { goto } from "$app/navigation";
    import type { ItemVoidFunction } from "./ReorderButtons.svelte";
    import ReorderButtons from "./ReorderButtons.svelte";
    import { formatPrice } from "$lib/price-formatter";
    import { page } from "$app/state";
    import ManageButtons from "./ManageButtons.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { ClaimAPI } from "$lib/api/claims";
    import Image from "$lib/components/Image.svelte";
    import type { ClassValue } from "svelte/elements";
    import type { MessageFormatter } from "$lib/server/i18n";
    import { getFormatter } from "$lib/i18n";
    import Markdown from "$lib/components/Markdown.svelte";
    import { resolve } from "$app/paths";
    import { toaster } from "$lib/components/toaster";
    import ItemDrawer from "../ItemDrawer.svelte";

    interface Props {
        item: ItemOnListDTO;
        user?: PartialUser; // logged in user
        showClaimedName?: boolean;
        requireClaimEmail?: boolean;
        groupId: string;
        showFor?: boolean;
        onPublicList?: boolean;
        reorderActions?: boolean;
        onIncreasePriority?: ItemVoidFunction | undefined;
        onDecreasePriority?: ItemVoidFunction | undefined;
    }

    const {
        item,
        groupId,
        user = undefined,
        showClaimedName = false,
        requireClaimEmail = true,
        showFor = false,
        onPublicList = false,
        reorderActions = false,
        onIncreasePriority = undefined,
        onDecreasePriority = undefined
    }: Props = $props();
    const id = $props.id();
    const t = getFormatter();

    let drawerOpen = $state(false);

    $effect(() => {
        if (page.url.searchParams.get("item-id") === item.id.toString()) {
            openDrawer();
        }
    });

    const imageUrl: string | undefined = $derived.by(() => {
        if (item.imageUrl) {
            try {
                new URL(item.imageUrl);
                return item.imageUrl;
            } catch {
                if (item.imageUrl.startsWith("/") || item.imageUrl.endsWith("/")) {
                    return;
                }
                return resolve("/api/assets/[id]", { id: item.imageUrl });
            }
        }
    });

    const claimAPI = $derived(new ClaimAPI(item.claims[0]?.claimId));

    const itemNameShort = $derived(item.name.length > 42 ? item.name.substring(0, 42) + "…" : item.name);

    const handleEdit = () => {
        goto(resolve("/items/[itemId]/edit", { itemId: item.id.toString() }) + `?redirectTo=${page.url.pathname}`);
    };

    const handlePurchased = async (purchased: boolean) => {
        const resp = await (purchased ? claimAPI.purchase() : claimAPI.unpurchase());
        if (resp.ok) {
            toaster.info({ description: $t("wishes.purchased-toast", { values: { purchased } }) });
            item.claims[0].purchased = purchased;
        }
    };

    function launchDrawer() {
        goto(`?item-id=${item.id}`, { replaceState: true, noScroll: true });
    }

    function openDrawer() {
        drawerOpen = true;
    }
</script>

{#snippet defaultImage(t: MessageFormatter, sizeClasses: ClassValue = ["w-24", "h-24", "md:w-40", "md:h-40"])}
    <div
        class={[
            "flex-none",
            "bg-surface-300-700",
            "grid",
            "place-items-center",
            "rounded",
            "aspect-square",
            sizeClasses
        ]}
        aria-label={t("a11y.default-item-image")}
        data-testid="image"
        role="img"
    >
        <iconify-icon class="w-8 md:w-16" height="none" icon="ion:gift"></iconify-icon>
    </div>
{/snippet}

<ItemDrawer
    {defaultImage}
    {groupId}
    {handleEdit}
    {handlePurchased}
    {item}
    {itemNameShort}
    {onPublicList}
    open={drawerOpen}
    {requireClaimEmail}
    {showFor}
    showName={showClaimedName}
    {user}
/>

<div
    class={[
        "card preset-filled-surface-100-900 block w-full text-start",
        reorderActions ? "" : "card-hover",
        item.approved ? "" : "preset-tonal-warning border-warning-500 border"
    ]}
    aria-labelledby={`${id}-name`}
    onclick={() => {
        if (!reorderActions) launchDrawer();
    }}
    onkeyup={(e) => {
        if (!reorderActions && e.key === "Enter") launchDrawer();
    }}
    role={reorderActions ? "none" : "button"}
>
    <header class="card-header flex w-full">
        {#if item.url}
            <a
                id={`${id}-name`}
                class="dark:!text-primary-200 line-clamp-2 text-xl font-bold md:text-2xl"
                data-testid="name"
                href={item.url}
                onclick={(e) => e.stopPropagation()}
                rel="noreferrer"
                target="_blank"
            >
                {item.name}
            </a>
        {:else}
            <span id={`${id}-name`} class="line-clamp-2 text-xl font-bold md:text-2xl" data-testid="name">
                {item.name}
            </span>
        {/if}
    </header>

    <div class="flex flex-row gap-x-4 p-4">
        <Image
            class="aspect-square h-24 w-24 rounded object-contain md:h-40 md:w-40"
            alt={item.name}
            data-testid="image"
            referrerpolicy="no-referrer"
            src={imageUrl}
        >
            {@render defaultImage($t)}
        </Image>

        <div class="flex flex-col">
            {#if item.price || item.itemPrice}
                <div class="flex items-center gap-x-2">
                    <iconify-icon icon="ion:pricetag"></iconify-icon>
                    <span class="text-lg font-semibold" data-testid="price">{formatPrice(item)}</span>
                </div>
            {/if}

            {#if item.quantity}
                <div class="grid grid-cols-[auto_1fr] items-center gap-2 text-base md:text-lg" data-testid="quantity">
                    <iconify-icon icon="ion:gift"></iconify-icon>
                    <div class="flex flex-row flex-wrap gap-x-2">
                        <span data-testid="quantity-desired">
                            {$t("wishes.quantity-desired", { values: { quantity: item.quantity } })}
                        </span>
                        {#if user?.id !== item.userId}
                            <span>·</span>
                            <span class="text-secondary-800-200 font-bold" data-testid="quantity-claimed">
                                {$t("wishes.quantity-claimed", { values: { quantity: item.claimedQuantity } })}
                            </span>
                        {/if}
                    </div>
                </div>
            {/if}

            <div class="flex items-center gap-2">
                <iconify-icon icon="ion:person"></iconify-icon>
                <span class="text-base text-wrap md:text-lg" data-testid="added-by">
                    {#if showFor}
                        {@html $t("wishes.for", { values: { name: item.user.name } })}
                    {:else if !onPublicList}
                        {@html $t("wishes.added-by", { values: { name: item.addedBy.name } })}
                    {:else}
                        {@html item.addedBy.id === item.user.id
                            ? $t("wishes.added-by", { values: { name: item.addedBy.name } })
                            : $t("wishes.added-by-somebody-else")}
                    {/if}
                </span>
            </div>

            {#if item.note}
                <div class="grid flex-none grid-cols-[auto_1fr] items-center gap-2">
                    <iconify-icon icon="ion:reader"></iconify-icon>
                    <div class="line-clamp-2 whitespace-pre-wrap" data-testid="notes">
                        <Markdown source={item.note} />
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <footer
        class="card-footer flex flex-row"
        class:justify-between={!reorderActions}
        class:justify-center={reorderActions}
    >
        {#if reorderActions}
            <ReorderButtons {item} {onDecreasePriority} {onIncreasePriority} />
        {:else}
            <ClaimButtons
                {groupId}
                {item}
                {onPublicList}
                onPurchase={handlePurchased}
                {requireClaimEmail}
                showName={showClaimedName}
                {user}
            />

            <ManageButtons {item} {itemNameShort} onEdit={handleEdit} {user} />
        {/if}
    </footer>
</div>
