<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import ClaimButtons from "../ClaimButtons.svelte";
    import { getItem } from "../context";
    import type { PartialUser } from "../ItemCard.svelte";
    import ReorderButtons from "../ReorderButtons.svelte";

    interface Props {
        user?: PartialUser;
        showClaimedName?: boolean;
        showClaimForOwner?: boolean;
        onPublicList?: boolean;
        reorderActions?: boolean;
        onIncreasePriority?: (itemId: number) => void;
        onDecreasePriority?: (itemId: number) => void;
        onClaim?: () => void;
        onUnclaim?: () => void;
        onPurchased?: (purchased: boolean) => void;
        onDelete?: () => void;
        onEdit?: () => void;
        onApproval?: (approve: boolean) => void;
    }

    const {
        user,
        showClaimedName = false,
        showClaimForOwner = false,
        onPublicList = false,
        reorderActions = false,
        onIncreasePriority,
        onDecreasePriority,
        onClaim,
        onUnclaim,
        onPurchased,
        onDelete,
        onEdit,
        onApproval
    }: Props = $props();

    const t = getFormatter();
    const item = getItem();
</script>

<footer
    class="card-footer flex flex-row items-center px-4 pb-4"
    class:justify-between={!reorderActions}
    class:justify-center={reorderActions}
>
    {#if reorderActions}
        <ReorderButtons {item} {onDecreasePriority} {onIncreasePriority} />
    {:else}
        <div class="flex items-center gap-x-2">
            <ClaimButtons
                {item}
                {onClaim}
                {onPublicList}
                onPurchase={onPurchased}
                {onUnclaim}
                showForOwner={showClaimForOwner}
                showName={showClaimedName}
                {user}
            />
        </div>

        <!-- Edit, Delete, or Approval buttons on the right -->
        <div class="flex items-center gap-x-2">
            {#if !item.approved}
                <!-- Approval buttons for unapproved items -->
                <button
                    class="variant-filled-success btn btn-sm"
                    onclick={(e) => {
                        e.stopPropagation();
                        onApproval?.(true);
                    }}
                >
                    {$t("wishes.approve")}
                </button>
                <button
                    class="variant-filled-error btn btn-sm"
                    onclick={(e) => {
                        e.stopPropagation();
                        onApproval?.(false);
                    }}
                >
                    {$t("wishes.deny")}
                </button>
            {:else if user?.id === item.user?.id || user?.id === item.addedBy?.id}
                <!-- Edit and Delete buttons for approved items owned by user -->
                <button
                    class="variant-ghost-primary btn btn-icon btn-icon-sm md:btn-icon-base"
                    aria-label={$t("wishes.edit")}
                    onclick={(e) => {
                        e.stopPropagation();
                        onEdit?.();
                    }}
                    title={$t("wishes.edit")}
                >
                    <iconify-icon icon="ion:edit"></iconify-icon>
                </button>
                <button
                    class="variant-filled-error btn btn-icon btn-icon-sm md:btn-icon-base"
                    aria-label={$t("wishes.delete")}
                    onclick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                    }}
                    title={$t("wishes.delete")}
                >
                    <iconify-icon icon="ion:trash"></iconify-icon>
                </button>
            {/if}
        </div>
    {/if}
</footer>
