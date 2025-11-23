<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import { getClaimedName, shouldShowName } from "../util";

    interface Props {
        item: ItemOnListDTO;
        user: PartialUser | undefined; // logged in user
        showName: boolean;
        showForOwner: boolean;
        onPublicList?: boolean;
        onClaim?: VoidFunction;
        onUnclaim?: VoidFunction;
        onPurchase?: (purchased: boolean) => void;
        onArchive?: (archived: boolean) => void;
    }

    let { item, user, showName, showForOwner, onPublicList = false, onClaim, onUnclaim, onPurchase, onArchive }: Props = $props();
    const t = getFormatter();

    const userClaim = $derived(item.claims.find((claim) => claim.claimedBy && claim.claimedBy.id === user?.id));
</script>

{#if !onPublicList && item.userId === user?.id && !showForOwner}
    <!-- Giftee viewing their own item - show archive button -->
    <div class="flex flex-row gap-x-2 md:gap-x-4">
        <button
            class={[
                "btn btn-icon btn-icon-sm md:btn-icon-base",
                item.archived && "variant-soft-warning",
                !item.archived && "variant-ringed-warning"
            ].join(" ")}
            aria-label={item.archived ? $t("a11y.unarchive") : $t("wishes.archive")}
            onclick={(e) => {
                e.stopPropagation();
                onArchive?.(!item.archived);
            }}
            title={item.archived ? $t("a11y.unarchive") : $t("wishes.archive")}
        >
            <iconify-icon icon={item.archived ? "ion:archive" : "ion:archive-outline"}></iconify-icon>
        </button>
    </div>
{:else if userClaim}
    <div class="flex flex-row gap-x-2 md:gap-x-4">
        <button
            class="variant-ghost-secondary btn btn-sm md:btn"
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
                userClaim.purchased && "variant-soft-secondary",
                !userClaim.purchased && "variant-ringed-secondary"
            ]}
            aria-label={userClaim.purchased ? $t("a11y.unpurchase") : $t("wishes.purchase")}
            onclick={(e) => {
                e.stopPropagation();
                onPurchase?.(!userClaim.purchased);
            }}
            title={userClaim.purchased ? $t("a11y.unpurchase") : $t("wishes.purchase")}
        >
            <iconify-icon icon={userClaim.purchased ? "ion:bag-check" : "ion:bag"}></iconify-icon>
        </button>
        <button
            class={[
                "btn btn-icon btn-icon-sm md:btn-icon-base",
                item.archived && "variant-soft-warning",
                !item.archived && "variant-ringed-warning"
            ].join(" ")}
            aria-label={item.archived ? $t("a11y.unarchive") : $t("wishes.archive")}
            onclick={(e) => {
                e.stopPropagation();
                onArchive?.(!item.archived);
            }}
            title={item.archived ? $t("a11y.unarchive") : $t("wishes.archive")}
        >
            <iconify-icon icon={item.archived ? "ion:archive" : "ion:archive-outline"}></iconify-icon>
        </button>
    </div>
{:else if item.isClaimable && item.userId !== user?.id}
    <div class="flex flex-row items-center gap-x-2 md:gap-x-4">
        <button
            class="variant-filled-secondary btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                onClaim?.();
            }}
        >
            {$t("wishes.claim")}
        </button>
    </div>
{:else if item.claims.length === 1 && shouldShowName(item, showName, showForOwner, user, item.claims[0])}
    <span>
        {$t("wishes.claimed-by", {
            values: {
                name: getClaimedName(item.claims[0])
            }
        })}
    </span>
{:else if item.claims.length > 1 && shouldShowName(item, showName, showForOwner, user)}
    <span>{$t("wishes.claimed-by-multiple-users")}</span>
{:else}
    <span>{$t("wishes.claimed")}</span>
{/if}
