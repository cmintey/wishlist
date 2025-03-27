<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import { t } from "svelte-i18n";
    import type { ItemOnListDTO, ClaimDTO } from "$lib/dtos/item-dto";

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
                dispatch("unclaim");
            }}
        >
            <!-- {$t("wishes.unclaim")} -->
            Update claim
        </button>
        <label class="checkbox-label text-sm md:text-base">
            <input
                class="checkbox"
                onchange={(event) => dispatch("purchase", { purchased: event.currentTarget?.checked })}
                onclick={(e) => e.stopPropagation()}
                type="checkbox"
                bind:checked={userClaim.purchased}
            />
            <span>{$t("wishes.purchased")}</span>
        </label>
    </div>
{:else if item.isClaimable}
    <div class="flex flex-row items-center space-x-2 md:space-x-4">
        <button
            class="variant-filled-secondary btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                dispatch("claim");
            }}
        >
            {$t("wishes.claim")}
        </button>
    </div>
{:else if item.claims.length === 1 && shouldShowName(item.claims[0])}
    {@const { claimedBy, publicClaimedBy } = item.claims[0]}
    <span>
        {$t("wishes.claimed-by", {
            values: { name: claimedBy ? claimedBy.name : publicClaimedBy.name || "Anonymous" } // TODO translate
        })}
    </span>
{:else if item.claims.length > 1}
    <span>Claimed by multiple users</span>
{:else}
    <span>{$t("wishes.claimed")}</span>
{/if}

<!-- {:else if item.claims.length > 0}
    {@const claim = item.claims[0]}
    {#if !onPublicList && claim.claimedBy?.id === user?.id}
        <div class="flex flex-row space-x-2 md:space-x-4">
            <button
                class="variant-ghost-secondary btn btn-sm md:btn"
                onclick={(e) => {
                    e.stopPropagation();
                    onUnclaim?.();
                }}
            >
                {$t("wishes.unclaim")}
            </button>
            <button
                class={[
                    "btn btn-icon btn-icon-sm md:btn-icon-base",
                    claim.purchased && "variant-soft-secondary",
                    !claim.purchased && "variant-ringed-secondary"
                ]}
                aria-label={claim.purchased ? $t("wishes.purchased") : $t("wishes.purchase")}
                onclick={(e) => {
                    e.stopPropagation();
                    onPurchase?.(!claim.purchased);
                    // claim.purchased = !claim.purchased;
                }}
            >
                <span><iconify-icon icon={claim.purchased ? "ion:bag-check" : "ion:bag"}></iconify-icon></span>
            </button>
        </div>
    {:else if shouldShowName(claim)}
        <span>
            {$t("wishes.claimed-by", {
                values: { name: claim.publicClaimedBy ? claim.publicClaimedBy.name : claim.claimedBy.name }
            })}
        </span>
    {:else}
        <span>{$t("wishes.claimed")}</span>
    {/if}
{:else}
    <button
        class="variant-filled-secondary btn btn-sm md:btn"
        onclick={(e) => {
            e.stopPropagation();
            onClaim?.();
        }}
    >
        {$t("wishes.claim")}
    </button>
{/if} -->
