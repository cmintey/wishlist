<script lang="ts">
    import type { InternalItemCardProps } from "./ItemCard.svelte";
    import { getFormatter } from "$lib/i18n";
    import { getClaimedName, shouldShowName } from "../util";
    import ClaimItemModal from "$lib/components/modals/ClaimItemModal.svelte";
    import { ClaimAPI } from "$lib/api/claims";
    import { toaster } from "$lib/components/toaster";

    type Props = Pick<
        InternalItemCardProps,
        | "item"
        | "user"
        | "showClaimedName"
        | "showNameAcrossGroups"
        | "showClaimForOwner"
        | "onPublicList"
        | "groupId"
        | "requireClaimEmail"
    >;

    let {
        item,
        user,
        showClaimedName = false,
        showNameAcrossGroups = false,
        showClaimForOwner = false,
        onPublicList = false,
        groupId,
        requireClaimEmail
    }: Props = $props();

    const t = getFormatter();

    const userClaim = $derived(item.claims.find((claim) => claim.claimedBy && claim.claimedBy.id === user?.id));
    const isClaimOnList = $derived(userClaim?.listId === item.listId);

    const handlePurchased = async (purchased: boolean) => {
        if (userClaim && isClaimOnList) {
            const claimAPI = new ClaimAPI(userClaim?.claimId);
            const resp = await (purchased ? claimAPI.purchase() : claimAPI.unpurchase());
            if (resp.ok) {
                toaster.info({ description: $t("wishes.purchased-toast", { values: { purchased } }) });
                userClaim.purchased = purchased;
            }
        }
    };
</script>

{#if !onPublicList && item.userId === user?.id && !showClaimForOwner}
    <div></div>
{:else if userClaim}
    {#if isClaimOnList}
        <div class="flex flex-row items-center gap-2">
            <ClaimItemModal claimId={userClaim.claimId} {groupId} {item} {requireClaimEmail} userId={user?.id}>
                {#snippet trigger(props)}
                    <button {...props} class="preset-tonal-secondary preset-outlined-secondary-500 btn btn-sm md:btn">
                        {item.quantity === 1 && userClaim.quantity === 1
                            ? $t("wishes.unclaim")
                            : $t("wishes.update-claim")}
                    </button>
                {/snippet}
            </ClaimItemModal>
            <button
                class={[
                    "btn btn-icon btn-icon-sm md:btn-icon-base",
                    userClaim.purchased && "preset-tonal-secondary preset-outlined-secondary-500",
                    !userClaim.purchased && "preset-outlined-secondary-500"
                ]}
                aria-label={userClaim.purchased ? $t("a11y.unpurchase") : $t("wishes.purchase")}
                onclick={(e) => {
                    e.stopPropagation();
                    handlePurchased?.(!userClaim.purchased);
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
        <ClaimItemModal {groupId} {item} {requireClaimEmail} userId={user?.id}>
            {#snippet trigger(props)}
                <button {...props} class="btn btn-sm md:btn preset-filled-secondary-300-700">
                    {$t("wishes.claim")}
                </button>
            {/snippet}
        </ClaimItemModal>
    </div>
{:else if item.claims.length === 0 || (item.userId === user?.id && item.isClaimable)}
    <div></div>
{:else if item.claims.length === 1 && shouldShowName(item, showClaimedName, showNameAcrossGroups, showClaimForOwner, user, item.claims[0])}
    <span class="text-subtle line-clamp-2 truncate text-wrap">
        {$t("wishes.claimed-by", {
            values: {
                name: getClaimedName(item.claims[0])
            }
        })}
    </span>
{:else if item.claims.length > 1 && shouldShowName(item, showClaimedName, showNameAcrossGroups, showClaimForOwner, user)}
    <span class="text-subtle line-clamp-2 truncate text-wrap">{$t("wishes.claimed-by-multiple-users")}</span>
{:else}
    <span class="text-subtle line-clamp-2 truncate text-wrap">{$t("wishes.claimed")}</span>
{/if}
