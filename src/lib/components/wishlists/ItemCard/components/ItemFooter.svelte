<script lang="ts">
    import ClaimButtons from "../ClaimButtons.svelte";
    import type { InternalItemCardProps } from "../ItemCard.svelte";
    import ManageButtons from "../ManageButtons.svelte";
    import ReorderButtons from "../ReorderButtons.svelte";

    const {
        item,
        user,
        userCanManage,
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
    }: Omit<InternalItemCardProps, "id" | "defaultImage"> = $props();
</script>

<footer
    class="card-footer flex flex-wrap items-center gap-2 px-4 pb-4"
    class:justify-between={!reorderActions}
    class:justify-center={reorderActions}
>
    {#if reorderActions}
        <ReorderButtons {item} {onDecreasePriority} {onIncreasePriority} />
    {:else}
        <ClaimButtons
            {item}
            {onClaim}
            {onPublicList}
            {onPurchased}
            {onUnclaim}
            {showClaimForOwner}
            {showClaimedName}
            {user}
        />

        <ManageButtons
            {item}
            onApprove={() => onApproval?.(true)}
            {onDelete}
            onDeny={() => onApproval?.(false)}
            {onEdit}
            {user}
            {userCanManage}
        />
    {/if}
</footer>
