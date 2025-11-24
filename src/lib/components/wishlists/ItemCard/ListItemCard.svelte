<script lang="ts">
    import type { InternalItemCardProps } from "./ItemCard.svelte";
    import type { MessageFormatter } from "$lib/server/i18n";
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
        defaultImage: _defaultImage
    }: InternalItemCardProps = $props();
</script>

<ItemNameHeader {id} {item} />

<div class="flex flex-row gap-x-4 p-4">
    <ItemImage class="aspect-square h-24 w-24 rounded object-contain md:h-40 md:w-40" {item}>
        {#snippet defaultImage(t: MessageFormatter)}
            {@render _defaultImage(t, "aspect-square size-24 rounded md:size-40")}
        {/snippet}
    </ItemImage>

    <div class="flex flex-col">
        <ItemAttributes {item} {onPublicList} {showClaimForOwner} {showClaimedName} {showFor} {user} />
    </div>
</div>

<!-- Footer with buttons -->
<ItemFooter
    {item}
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
