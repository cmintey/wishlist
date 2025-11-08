<script lang="ts">
    import ClaimButtons from "../ClaimButtons.svelte";
    import { getItem } from "../context";
    import type { PartialUser } from "../ItemCard.svelte";
    import ManageButtons from "../ManageButtons.svelte";
    import ReorderButtons from "../ReorderButtons.svelte";

    interface Props {
        user?: PartialUser;
        userCanManage: boolean;
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
    }: Props = $props();

    const item = getItem();
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
            onPurchase={onPurchased}
            {onUnclaim}
            showForOwner={showClaimForOwner}
            showName={showClaimedName}
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
