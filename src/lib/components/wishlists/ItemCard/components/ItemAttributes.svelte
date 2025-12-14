<script lang="ts">
    import Markdown from "$lib/components/Markdown.svelte";
    import { getFormatter } from "$lib/i18n";
    import { formatPrice } from "$lib/price-formatter";
    import { shouldShowName, getClaimedName } from "../../util";
    import type { ItemCardProps } from "../ItemCard.svelte";

    interface Props extends Pick<
        ItemCardProps,
        "item" | "onPublicList" | "user" | "showClaimForOwner" | "showClaimedName" | "showFor"
    > {
        showDetail?: boolean;
        fullNotes?: boolean;
    }

    const t = getFormatter();
    const {
        item,
        onPublicList,
        user,
        showClaimedName,
        showClaimForOwner = false,
        showFor,
        showDetail = false,
        fullNotes = false
    }: Props = $props();

    let expandClaims = $state(false);
</script>

<!-- Price with fallback -->
{#if item.price || item.itemPrice}
    <div class="flex items-center gap-x-2">
        <iconify-icon icon="ion:pricetag"></iconify-icon>
        <span data-testid="price">
            {formatPrice(item)}
        </span>
    </div>
{/if}

<!-- Quantity with fallback -->
<div class="flex items-center gap-2" data-testid="quantity">
    <iconify-icon icon="ion:gift"></iconify-icon>
    <div class="flex flex-row flex-wrap gap-x-2">
        <span data-testid="quantity-desired">
            {#if item.quantity}
                {$t("wishes.quantity-desired", { values: { quantity: item.quantity } })}
            {:else}
                {$t("wishes.no-limit")}
            {/if}
        </span>
        {#if item.quantity && (user?.id !== item.userId || showClaimForOwner)}
            <span>·</span>
            <span class="text-secondary-700-200-token font-bold" data-testid="quantity-claimed">
                {$t("wishes.quantity-claimed", { values: { quantity: item.claimedQuantity } })}
            </span>
        {/if}
    </div>
</div>
{#if showDetail && showClaimedName && item.claims.length > 0 && (item.userId !== user?.id || showClaimForOwner)}
    <div class="card text-sm">
        <button
            class="flex w-full items-center !justify-start gap-2 p-2 !text-start text-sm"
            onclick={() => (expandClaims = !expandClaims)}
        >
            <iconify-icon icon={expandClaims ? "ion:chevron-up" : "ion:chevron-down"}></iconify-icon>
            <span>{expandClaims ? $t("wishes.hide-claims") : $t("wishes.show-claims")}</span>
        </button>

        {#if expandClaims}
            <div class="max-h-32 overflow-auto px-2 pb-2">
                {#each item.claims as claim}
                    {@const showName = shouldShowName(item, showClaimedName, showClaimForOwner, user, claim)}
                    <div class="flex items-center justify-between py-1">
                        <span>{showName ? getClaimedName(claim) : $t("wishes.anonymous")}</span>
                        <span>
                            {$t("wishes.claims", { values: { claimCount: claim.quantity } })}
                        </span>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
{/if}

<!-- Added by / For (claims page) -->
<div class="flex items-center gap-2">
    <iconify-icon icon="ion:person"></iconify-icon>
    <span class="text-wrap" data-testid="added-by">
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

<!-- Notes -->
{#if item.note}
    <div class="grid flex-none grid-cols-[auto_1fr] items-center gap-2">
        <iconify-icon icon="ion:reader"></iconify-icon>
        <div class={["whitespace-pre-wrap", fullNotes ? "" : "line-clamp-2"]} data-testid="notes">
            <Markdown source={item.note} />
        </div>
    </div>
{/if}
