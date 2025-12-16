<script lang="ts">
    import type { InternalItemCardProps } from "./ItemCard.svelte";
    import { getFormatter } from "$lib/i18n";
    import { getClaimedName, shouldShowName } from "../util";

    type Props = Pick<
        InternalItemCardProps,
        | "item"
        | "user"
        | "showClaimedName"
        | "showClaimForOwner"
        | "onPublicList"
        | "onClaim"
        | "onUnclaim"
        | "onPurchased"
    >;

    let {
        item,
        user,
        showClaimedName = false,
        showClaimForOwner = false,
        onPublicList = false,
        onClaim,
        onUnclaim,
        onPurchased
    }: Props = $props();

    const t = getFormatter();

    const userClaim = $derived(item.claims.find((claim) => claim.claimedBy && claim.claimedBy.id === user?.id));
    const isClaimOnList = $derived(userClaim?.listId === item.listId);
</script>

{#if !onPublicList && item.userId === user?.id && !showClaimForOwner}
    <div></div>
{:else if userClaim}
    {#if isClaimOnList}
        <div class="flex flex-row gap-2">
            <button
                class="preset-tonal-secondary border border-secondary-500 btn btn-sm md:btn"
                onclick={(e) => {
                    e.stopPropagation();
                    onUnclaim?.();
                }}
            >
                {item.quantity === 1 && userClaim.quantity === 1 ? $t("wishes.unclaim") : $t("wishes.update-claim")}
            </button>
            <button
                class={[
                    "btn btn-icon btn-icon-sm md:btn-icon-base",
                    userClaim.purchased && "preset-tonal-secondary",
                    !userClaim.purchased && "preset-outlined-secondary-500"
                ]}
                aria-label={userClaim.purchased ? $t("a11y.unpurchase") : $t("wishes.purchase")}
                onclick={(e) => {
                    e.stopPropagation();
                    onPurchased?.(!userClaim.purchased);
                }}
                title={userClaim.purchased ? $t("a11y.unpurchase") : $t("wishes.purchase")}
            >
                <iconify-icon icon={userClaim.purchased ? "ion:bag-check" : "ion:bag"}></iconify-icon>
            </button>
        </div>
    {:else}
        <span class="text-subtle text-wrap">{$t("wishes.claimed-by-you-on-another-list")}</span>
    {/if}
{:else if item.isClaimable && item.userId !== user?.id}
    <div class="flex flex-row items-center gap-x-2">
        <button
            class="preset-filled-secondary-500 btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                onClaim?.();
            }}
        >
            {$t("wishes.claim")}
        </button>
    </div>
{:else if item.claims.length === 0 || (item.userId === user?.id && item.isClaimable)}
    <div></div>
{:else if item.claims.length === 1 && shouldShowName(item, showClaimedName, showClaimForOwner, user, item.claims[0])}
    <span class="text-subtle line-clamp-2 truncate text-wrap">
        {$t("wishes.claimed-by", {
            values: {
                name: getClaimedName(item.claims[0])
            }
        })}
    </span>
{:else if item.claims.length > 1 && shouldShowName(item, showClaimedName, showClaimForOwner, user)}
    <span class="text-subtle line-clamp-2 truncate text-wrap">{$t("wishes.claimed-by-multiple-users")}</span>
{:else}
    <span class="text-subtle line-clamp-2 truncate text-wrap">{$t("wishes.claimed")}</span>
{/if}
