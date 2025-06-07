<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO, ClaimDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        item: ItemOnListDTO;
        user: PartialUser | undefined; // logged in user
        showName: boolean;
        onPublicList?: boolean;
        onClaim?: VoidFunction;
        onUnclaim?: VoidFunction;
        onPurchase?: (purchased: boolean) => void;
    }

    let { item, user, showName, onPublicList = false, onClaim, onUnclaim, onPurchase }: Props = $props();
    const t = getFormatter();

    const shouldShowName = (claim: ClaimDTO) => {
        return (
            (showName && onPublicList && claim.publicClaimedBy?.name) ||
            (user && claim.claimedBy?.groups.includes(user.activeGroupId) && claim.claimedBy?.name)
        );
    };

    const userClaim = $derived(item.claims.find((claim) => claim.claimedBy && claim.claimedBy.id === user?.id));
</script>

{#if !onPublicList && item.userId === user?.id}
    <div></div>
{:else if userClaim}
    <div class="flex flex-row space-x-2 md:space-x-4">
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
    </div>
{:else if item.isClaimable}
    <div class="flex flex-row items-center space-x-2 md:space-x-4">
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
{:else if item.claims.length === 1 && shouldShowName(item.claims[0])}
    {@const { claimedBy, publicClaimedBy } = item.claims[0]}
    <span>
        {$t("wishes.claimed-by", {
            values: { name: claimedBy ? claimedBy.name : publicClaimedBy.name || $t("wishes.anonymous") }
        })}
    </span>
{:else if item.claims.length > 1}
    <span>{$t("wishes.claimed-by-multiple-users")}</span>
{:else}
    <span>{$t("wishes.claimed")}</span>
{/if}
