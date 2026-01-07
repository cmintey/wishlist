<script lang="ts">
    import type { InternalItemCardProps } from "./ItemCard.svelte";
    import ItemNameHeader from "./components/ItemNameHeader.svelte";
    import ItemAttributes from "./components/ItemAttributes.svelte";
    import ItemFooter from "./components/ItemFooter.svelte";
    import ItemImage from "./components/ItemImage.svelte";

    const {
        id,
        item,
        user,
        userCanManage = false,
        showClaimedName = false,
        showNameAcrossGroups = false,
        showClaimForOwner = false,
        showFor = false,
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
        onApproval,
        defaultImage: _defaultImage
    }: InternalItemCardProps = $props();
</script>

<div class="flex h-full flex-col">
    <!-- Image extends to card edges -->
    <div class="relative h-48 w-full overflow-hidden p-[1px]">
        <ItemImage class="h-full w-full object-cover rounded-tl-container-token rounded-tr-container-token" {item}>
            {#snippet defaultImage(t)}
                {@render _defaultImage(t, "rounded-tl-container-token rounded-tr-container-token  h-full w-full")}
            {/snippet}
        </ItemImage>
    </div>

    <!-- Title below image -->
    <ItemNameHeader {id} {item} />

    <!-- Content area with consistent padding -->
    <div class="flex flex-1 flex-col space-y-1 p-4">
        <ItemAttributes {item} {onPublicList} {showClaimForOwner} {showClaimedName} {showFor} {user} />
    </div>

    <ItemFooter
        {item}
        {onApproval}
        {onClaim}
        {onDecreasePriority}
        {onDelete}
        {onEdit}
        {onIncreasePriority}
        {onPriorityChange}
        {onPurchased}
        {onUnclaim}
        {reorderActions}
        {showClaimForOwner}
        {showClaimedName}
        {showNameAcrossGroups}
        {user}
        {userCanManage}
    />
</div>
