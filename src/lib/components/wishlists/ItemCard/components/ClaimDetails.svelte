<script lang="ts">
    import ClaimItemModal from "$lib/components/modals/ClaimItemModal.svelte";
    import type { ClaimDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import { getClaimedName } from "../../util";
    import type { ItemCardProps } from "../ItemCard.svelte";

    interface Props extends Pick<ItemCardProps, "item" | "user" | "groupId" | "requireClaimEmail"> {
        showName: (claim?: ClaimDTO) => boolean;
    }

    let { showName, item, user, groupId, requireClaimEmail }: Props = $props();
    let t = getFormatter();

    let isForOwner = $derived(item.userId === user?.id);
</script>

<div class="card text-sm max-h-32 overflow-auto px-2 py-1 bg-surface-200-800">
    {#each item.claims as claim}
        {const name =
            showName(claim) || claim.claimedBy?.id === user?.id ? getClaimedName(claim) : $t("wishes.anonymous")}
        <div class="flex items-center justify-between py-1">
            <span>{name}</span>
            <div class="flex flex-row items-center gap-2">
                <span>
                    {$t("wishes.claims", { values: { claimCount: claim.quantity } })}
                </span>
                {#if isForOwner}
                    <ClaimItemModal
                        alwaysShow
                        claimId={claim.claimId}
                        claimName={name}
                        {groupId}
                        {item}
                        {requireClaimEmail}
                        userId={user?.id}
                    >
                        {#snippet trigger(props)}
                            <button
                                {...props}
                                class="btn btn-icon btn-icon-sm preset-tonal inset-ring-surface-500 p-1.5 inset-ring"
                                title="Edit claim"
                            >
                                <iconify-icon class="text-tiny" icon="ion:edit"></iconify-icon>
                                <span class="sr-only">Edit claim</span>
                            </button>
                        {/snippet}
                    </ClaimItemModal>
                {/if}
            </div>
        </div>
    {/each}
</div>
