<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO, ClaimDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import ClaimItemModal from "$lib/components/modals/ClaimItemModal.svelte";

    interface Props {
        item: ItemOnListDTO;
        user: PartialUser | undefined; // logged in user
        showName: boolean;
        groupId: string;
        requireClaimEmail: boolean;
        onPublicList?: boolean;
        onPurchase?: (purchased: boolean) => void;
    }

    let { item, user, showName, groupId, requireClaimEmail, onPublicList = false, onPurchase }: Props = $props();
    const t = getFormatter();

    const shouldShowName = (claim?: ClaimDTO) => {
        if (showName) {
            if (onPublicList && claim?.publicClaimedBy?.name) {
                return true;
            }
            if (user && claim?.claimedBy?.groups.includes(user.activeGroupId) && claim.claimedBy?.name) {
                return true;
            }
        }
        return false;
    };

    const userClaim = $derived(item.claims.find((claim) => claim.claimedBy && claim.claimedBy.id === user?.id));

    const getClaimedByName = ({ claimedBy, publicClaimedBy }: ClaimDTO) => {
        return claimedBy
            ? claimedBy.name
            : publicClaimedBy.name === "ANONYMOUS_NAME"
              ? $t("wishes.anonymous")
              : publicClaimedBy.name;
    };
</script>

{#if !onPublicList && item.userId === user?.id}
    <div></div>
{:else if userClaim}
    <div class="flex flex-row gap-x-2 md:gap-x-4">
        <ClaimItemModal claimId={userClaim.claimId} {groupId} {item} {requireClaimEmail} userId={user?.id}>
            {#snippet trigger(props)}
                <button class="preset-tonal-secondary border-secondary-500 btn btn-sm md:btn border" {...props}>
                    {item.quantity === 1 && userClaim.quantity === 1 ? $t("wishes.unclaim") : $t("wishes.update-claim")}
                </button>
            {/snippet}
        </ClaimItemModal>

        <button
            class={[
                "btn btn-icon btn-icon-sm md:btn-icon-base",
                userClaim.purchased && "preset-tonal-secondary",
                !userClaim.purchased && "preset-outlined-secondary-500"
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
    <div class="flex flex-row items-center gap-x-2 md:gap-x-4">
        <ClaimItemModal {groupId} {item} {requireClaimEmail} userId={user?.id}>
            {#snippet trigger(props)}
                <button class="preset-filled-secondary-500 btn btn-sm md:btn" {...props}>
                    {$t("wishes.claim")}
                </button>
            {/snippet}
        </ClaimItemModal>
    </div>
{:else if item.claims.length === 1 && shouldShowName(item.claims[0])}
    {@const claim = item.claims[0]}
    <span>{$t("wishes.claimed-by", { values: { name: getClaimedByName(claim) } })}</span>
{:else if item.claims.length > 1 && shouldShowName()}
    <span>{$t("wishes.claimed-by-multiple-users")}</span>
{:else}
    <span>{$t("wishes.claimed")}</span>
{/if}
