<script lang="ts">
    import Markdown from "$lib/components/Markdown.svelte";
    import { getFormatter } from "$lib/i18n";
    import { formatPrice } from "$lib/price-formatter";
    import { getItem } from "../context";
    import type { ItemCardProps } from "../ItemCard.svelte";

    type Props = Pick<ItemCardProps, "onPublicList" | "user" | "showClaimForOwner" | "showFor">;

    const t = getFormatter();
    const item = getItem();
    const { onPublicList, user, showClaimForOwner, showFor }: Props = $props();
</script>

<!-- Price with fallback -->
<div class="flex items-center gap-x-2">
    <iconify-icon icon="ion:pricetag"></iconify-icon>
    <span class="text-lg font-semibold" data-testid="price">
        {#if item.price || item.itemPrice}
            {formatPrice(item)}
        {:else}
            $ -
        {/if}
    </span>
</div>

<!-- Quantity with fallback -->
<div class="flex items-center gap-2 text-base md:text-lg" data-testid="quantity">
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

<!-- Added by / For (claims page) -->
<div class="flex items-center gap-2">
    <iconify-icon icon="ion:person"></iconify-icon>
    <span class="text-wrap text-base md:text-lg" data-testid="added-by">
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
<!-- TODO: list item card has line-clamp-2 -->
<div class="grid flex-none grid-cols-[auto_1fr] items-center gap-2">
    <iconify-icon icon="ion:reader"></iconify-icon>
    <div class="line-clamp-1 whitespace-pre-wrap" data-testid="notes">
        {#if item.note}
            <Markdown source={item.note} />
        {:else}
            -
        {/if}
    </div>
</div>
