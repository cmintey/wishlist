<script lang="ts">
    import Markdown from "$lib/components/Markdown.svelte";
    import type { ClaimDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import { formatPrice } from "$lib/price-formatter";
    import { shouldShowName } from "../../util";
    import type { ItemCardProps } from "../ItemCard.svelte";
    import ClaimDetails from "./ClaimDetails.svelte";

    interface Props extends Pick<
        ItemCardProps,
        | "item"
        | "onPublicList"
        | "user"
        | "requireClaimEmail"
        | "showClaimForOwner"
        | "showClaimedName"
        | "showNameAcrossGroups"
        | "showFor"
        | "groupId"
    > {
        showDetail?: boolean;
        fullNotes?: boolean;
    }

    const t = getFormatter();
    const {
        item,
        onPublicList,
        user,
        groupId,
        showClaimedName,
        requireClaimEmail,
        showNameAcrossGroups = false,
        showClaimForOwner = false,
        showFor,
        showDetail = false,
        fullNotes = false
    }: Props = $props();

    let expandClaims = $state(false);
    let shouldShowClaimName = $derived((claim?: ClaimDTO) =>
        shouldShowName(item, showClaimedName, showNameAcrossGroups, showClaimForOwner, user, claim)
    );
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
    <div class="flex flex-row flex-wrap items-end gap-x-2">
        <span data-testid="quantity-desired">
            {#if item.quantity}
                {$t("wishes.quantity-desired", { values: { quantity: item.quantity } })}
            {:else}
                {$t("wishes.no-limit")}
            {/if}
        </span>
        {#if item.quantity && (user?.id !== item.userId || showClaimForOwner)}
            <span>·</span>
            <span class="text-secondary-900-100 font-bold" data-testid="quantity-claimed">
                {$t("wishes.quantity-claimed", { values: { quantity: item.claimedQuantity } })}
            </span>
            {#if showDetail && item.claimedQuantity > 0}
                <button class="subtext" onclick={() => (expandClaims = !expandClaims)}>
                    <span>{expandClaims ? $t("wishes.hide-claims") : $t("wishes.show-claims")}</span>
                    <iconify-icon
                        class="text-xs"
                        icon={expandClaims ? "ion:chevron-up" : "ion:chevron-down"}
                    ></iconify-icon>
                </button>
            {/if}
        {/if}
    </div>
</div>
{#if showDetail}
    <ClaimDetails expand={expandClaims} {groupId} {item} {requireClaimEmail} showName={shouldShowClaimName} {user} />
{/if}

<!-- Added by / For (claims page) -->
<div class="flex items-center gap-2">
    <iconify-icon icon="ion:person"></iconify-icon>
    <span class="text-wrap" data-testid="added-by">
        {#if showFor}
            {@html $t("wishes.for", { values: { name: item.user.name, class: "text-secondary-900-100 font-bold" } })}
        {:else if !onPublicList}
            {@html $t("wishes.added-by", {
                values: { name: item.addedBy.name, class: "text-secondary-900-100 font-bold" }
            })}
        {:else}
            {@html item.addedBy.id === item.user.id
                ? $t("wishes.added-by", {
                      values: { name: item.addedBy.name, class: "text-secondary-900-100 font-bold" }
                  })
                : $t("wishes.added-by-somebody-else", { values: { class: "text-secondary-900-100 font-bold" } })}
        {/if}
    </span>
</div>

<!-- Notes -->
{#if item.note}
    <div class="grid flex-none grid-cols-[auto_1fr] items-center gap-2">
        <iconify-icon icon="ion:reader"></iconify-icon>
        <div class={["whitespace-pre-wrap print:line-clamp-none", fullNotes ? "" : "line-clamp-2"]} data-testid="notes">
            <Markdown source={item.note} />
        </div>
    </div>
{/if}
