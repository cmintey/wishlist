<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import ItemNameHeader from "./components/ItemNameHeader.svelte";
    import ItemAttributes from "./components/ItemAttributes.svelte";
    import ItemFooter from "./components/ItemFooter.svelte";
    import ItemImage from "./components/ItemImage.svelte";

    interface Props {
        item: ItemOnListDTO;
        user?: PartialUser;
        showClaimedName?: boolean;
        showClaimForOwner?: boolean;
        requireClaimEmail?: boolean;
        groupId?: string;
        showFor?: boolean;
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
        id: string;
    }

    const {
        item,
        user,
        showClaimedName = false,
        showClaimForOwner = false,
        requireClaimEmail = true,
        groupId,
        showFor = false,
        onPublicList = false,
        reorderActions = false,
        onIncreasePriority,
        onDecreasePriority,
        onClaim,
        onUnclaim,
        onPurchased,
        onDelete,
        onEdit,
        onApproval,
        id
    }: Props = $props();
</script>

<div class="flex h-full flex-col">
    <!-- Image extends to card edges -->
    <div class="relative h-48 w-full overflow-hidden rounded-t-lg">
        <ItemImage>
            {#snippet defaultImage(t, sizeClasses)}
                <div class="flex h-full w-full items-center justify-center rounded-t-lg bg-transparent">
                    <iconify-icon class="h-16 w-16" height="none" icon="ion:gift"></iconify-icon>
                </div>
            {/snippet}
        </ItemImage>
    </div>

    <!-- Title below image -->
    <ItemNameHeader />

    <!-- Content area with consistent padding -->
    <div class="flex flex-1 flex-col space-y-2 p-4">
        <ItemAttributes {onPublicList} {showClaimForOwner} {showFor} {user} />
    </div>

    <ItemFooter
        {onApproval}
        {onClaim}
        {onDecreasePriority}
        {onDelete}
        {onEdit}
        {onIncreasePriority}
        {onPurchased}
        {onUnclaim}
        {reorderActions}
        {showClaimForOwner}
        {showClaimedName}
        {user}
    />
</div>
