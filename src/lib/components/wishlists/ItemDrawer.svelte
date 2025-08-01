<script lang="ts">
    import { getDrawerStore } from "@skeletonlabs/skeleton";
    import type { PartialUser } from "./ItemCard/ItemCard.svelte";
    import ClaimButtons from "./ItemCard/ClaimButtons.svelte";
    import ManageButtons from "./ItemCard/ManageButtons.svelte";
    import { formatPrice } from "$lib/price-formatter";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import type { Snippet } from "svelte";
    import Image from "../Image.svelte";
    import type { ClassValue } from "svelte/elements";
    import type { MessageFormatter } from "$lib/server/i18n";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import Markdown from "../Markdown.svelte";

    const t = getFormatter();
    const drawerStore = getDrawerStore();
    const item: ItemOnListDTO = $drawerStore.meta.item;
    const user: PartialUser | undefined = $drawerStore.meta.user;
    const userCanManage: boolean = $drawerStore.meta.userCanManage;
    const showFor: boolean = $drawerStore.meta.showFor;
    const showName: boolean = $drawerStore.meta.showName;
    const onPublicList: boolean = $drawerStore.meta.onPublicList;
    const handleClaim: (v?: boolean) => void = $drawerStore.meta.handleClaim;
    const handleDelete: VoidFunction = $drawerStore.meta.handleDelete;
    const handlePurchased: (v: boolean) => void = $drawerStore.meta.handlePurchased;
    const handleApproval: (v: boolean) => void = $drawerStore.meta.handleApproval;
    const handleEdit: () => void = $drawerStore.meta.handleEdit;
    const defaultImage: Snippet<[MessageFormatter, ClassValue]> = $drawerStore.meta.defaultImage;

    let showClaims = $state(false);

    interface GroupedClaim {
        userId: string;
        userName: string;
        count: number;
        claims: any[];
    }

    // Group claims by user and count them
    const groupedClaims = $derived(() => {
        if (!item.claims) return [];

        const claimMap = new Map<string, GroupedClaim>();

        for (const claim of item.claims) {
            const { claimedBy, publicClaimedBy } = claim
            const userId = claimedBy?.id || publicClaimedBy?.id;
            const userName = claimedBy ? claimedBy.name : (publicClaimedBy.name === "ANONYMOUS_NAME" ? $t("wishes.anonymous") : publicClaimedBy.name);

            if (!userId || !userName) continue;

            if (!claimMap.has(userId)) {
                claimMap.set(userId, {
                    userId,
                    userName,
                    count: 0,
                    claims: []
                });
            }

            const userClaims = claimMap.get(userId);
            if (userClaims) {
                userClaims.count += 1;
                userClaims.claims.push(claim);
            }
        }

        return Array.from(claimMap.values());
    });

    const onEdit = () => {
        goto(page.url.pathname, { replaceState: true, noScroll: true });
        drawerStore.close();
        handleEdit();
    };

    let imageUrl: string | undefined = $state();
    if (item.imageUrl) {
        try {
            new URL(item.imageUrl);
            imageUrl = item.imageUrl;
        } catch {
            imageUrl = `/api/assets/${item.imageUrl}`;
        }
    }
</script>

<div class="flex max-h-[80dvh] flex-col gap-2 p-4 pb-4">
    <div class="grid grid-cols-[1fr_auto] justify-between gap-2 pb-2">
        <span class="text-wrap break-words text-xl font-bold md:text-2xl">
            {item.name}
        </span>
        <button
            class="variant-ghost-surface btn btn-icon"
            aria-label={$t("a11y.close")}
            onclick={() => {
                goto(page.url.pathname, { replaceState: true, noScroll: true });
                drawerStore.close();
            }}
        >
            <iconify-icon icon="ion:close"></iconify-icon>
        </button>
    </div>

    <div class="flex max-h-[40dvh] justify-center">
        <Image class="max-h-full object-scale-down" alt={item.name} referrerpolicy="no-referrer" src={imageUrl}>
            {@render defaultImage($t, "w-1/3 aspect-square")}
        </Image>
    </div>

    {#if item.url}
        <a class="dark:!text-primary-200" href={item.url} rel="noreferrer" target="_blank">{$t("wishes.view-item")}</a>
    {/if}

    {#if item.price || item.itemPrice}
        <div class="flex items-center gap-x-2">
            <iconify-icon icon="ion:pricetag"></iconify-icon>
            <span class="text-lg font-semibold">{formatPrice(item)}</span>
        </div>
    {/if}

    {#if item.quantity}
        <div class="grid grid-cols-[auto_1fr] items-center gap-2 text-base md:text-lg">
            <iconify-icon icon="ion:gift"></iconify-icon>
            <div class="flex flex-row flex-wrap gap-x-2">
                <span>{$t("wishes.quantity-desired", { values: { quantity: item.quantity } })}</span>
                {#if user?.id !== item.userId}
                    <span>·</span>
                    <span class="text-secondary-700-200-token font-bold">
                        {$t("wishes.quantity-claimed", { values: { quantity: item.claimedQuantity } })}
                    </span>
                {/if}
            </div>
        </div>
        {#if item.claims && item.claims.length > 0}
            <div class="rounded-lg bg-surface-100 p-2 text-sm border border-surface-300">

                <button
                    class="flex w-full items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    onclick={() => (showClaims = !showClaims)}
                >
                    <iconify-icon icon={showClaims ? "ion:chevron-up" : "ion:chevron-down"}></iconify-icon>
                    {showClaims ? $t("wishes.hide-claims") : $t("wishes.show-claims")}
                </button>

                {#if showClaims}
                    <div class="p-2">
                        {#each groupedClaims() as claimGroup}
                            <div class="flex items-center justify-between py-1">
                                <span>{claimGroup.userName}</span>
                                <span>{claimGroup.count} {$t("wishes.claims")}</span>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    {/if}

    <div class="flex items-center gap-x-2">
        <iconify-icon icon="ion:person"></iconify-icon>
        <span class="text-base md:text-lg">
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
            <p class="whitespace-pre-wrap">
                <Markdown source={item.note} />
            </p>
        </div>
    {/if}

    <div class="flex flex-row justify-between pb-4">
        <ClaimButtons
            {item}
            onClaim={handleClaim}
            {onPublicList}
            onPurchase={handlePurchased}
            onUnclaim={() => handleClaim(true)}
            {showName}
            {user}
        />

        <ManageButtons
            {item}
            onApprove={() => handleApproval(true)}
            onDelete={handleDelete}
            onDeny={() => handleApproval(false)}
            {onEdit}
            {user}
            {userCanManage}
        />
    </div>
</div>
