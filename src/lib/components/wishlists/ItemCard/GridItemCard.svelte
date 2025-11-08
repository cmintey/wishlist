<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import ItemNameHeader from "./components/ItemNameHeader.svelte";
    import ItemAttributes from "./components/ItemAttributes.svelte";
    import ItemFooter from "./components/ItemFooter.svelte";
    import ItemImage from "./components/ItemImage.svelte";

    interface Props {
        item: ItemOnListDTO;
        user?: PartialUser;
        userCanManage?: boolean;
        showClaimedName?: boolean;
        showClaimForOwner?: boolean;
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
        userCanManage = false,
        showClaimedName = false,
        showClaimForOwner = false,
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
    <div class="relative h-48 w-full overflow-hidden p-[1px]">
        <ItemImage class="h-full w-full object-cover rounded-tl-container-token rounded-tr-container-token">
            {#snippet defaultImage(t, _sizeClasses)}
                <div
                    class="bg-surface-300-600-token flex h-full w-full items-center justify-center rounded-tl-container-token rounded-tr-container-token"
                    aria-label={t("a11y.default-item-image")}
                >
                    <iconify-icon class="h-16 w-16" height="none" icon="ion:gift"></iconify-icon>
                </div>
            {/snippet}
        </ItemImage>
    </div>

    <!-- Title below image -->
    <ItemNameHeader />

    <!-- Content area with consistent padding -->
    <div class="flex flex-1 flex-col space-y-1 p-4">
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
        {userCanManage}
    />
</div>
