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
        showAlwaysClaimedName = false,
        onPublicList = false,
        reorderActions = false,
        onIncreasePriority,
        onDecreasePriority,
        onPriorityChange,
        onClaim,
        onUnclaim,
        onPurchased,
        onDelete,
        onEdit,
        onApproval
    }: Omit<InternalItemCardProps, "id" | "defaultImage"> = $props();
</script>

<footer
    class={[
        "card-footer flex flex-wrap items-center gap-2 px-4",
        reorderActions ? "justify-center pb-0" : "justify-between"
    ]}
>
    {#if reorderActions}
        <ReorderButtons {item} {onDecreasePriority} {onIncreasePriority} {onPriorityChange} />
    {:else}
        <ClaimButtons
            {item}
            {onClaim}
            {onPublicList}
            {onPurchased}
            {onUnclaim}
            {showClaimForOwner}
            {showAlwaysClaimedName}
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
