<script lang="ts">
    import type { InternalItemCardProps } from "./ItemCard.svelte";
    import type { MessageFormatter } from "$lib/server/i18n";
    import ItemNameHeader from "./components/ItemNameHeader.svelte";
    import ItemAttributes from "./components/ItemAttributes.svelte";
    import ItemFooter from "./components/ItemFooter.svelte";
    import type { ClassValue } from "svelte/elements";
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
        onApproval
    }: InternalItemCardProps = $props();
</script>

<ItemNameHeader {id} {item} />

<div class="flex flex-row gap-x-4 p-4">
    <ItemImage class="aspect-square h-24 w-24 rounded object-contain md:h-40 md:w-40" {item}>
        {#snippet defaultImage(t: MessageFormatter, sizeClasses: ClassValue = ["w-24", "h-24", "md:w-40", "md:h-40"])}
            <div
                class={[
                    "flex-none",
                    "bg-surface-300-600-token",
                    "grid",
                    "place-items-center",
                    sizeClasses.includes("w-full") ? "rounded-t-container-token" : "rounded",
                    sizeClasses.includes("w-full") ? "" : "aspect-square",
                    sizeClasses
                ]}
                aria-label={t("a11y.default-item-image")}
                data-testid="image"
                role="img"
            >
                <iconify-icon
                    class={sizeClasses.includes("w-full") ? "h-16 w-16" : "w-8 md:w-16"}
                    height="none"
                    icon="ion:gift"
                ></iconify-icon>
            </div>
        {/snippet}
    </ItemImage>

    <div class="flex flex-col">
        <ItemAttributes {item} {onPublicList} {showClaimForOwner} {showFor} {user} />
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
