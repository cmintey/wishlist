<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import type { MessageFormatter } from "$lib/server/i18n";
    import ItemNameHeader from "./components/ItemNameHeader.svelte";
    import ItemAttributes from "./components/ItemAttributes.svelte";
    import ItemFooter from "./components/ItemFooter.svelte";
    import type { ClassValue } from "svelte/elements";
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

<ItemNameHeader />

<div class="flex flex-row gap-x-4 p-4">
    <ItemImage class="aspect-square h-24 w-24 rounded object-contain md:h-40 md:w-40">
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
        <ItemAttributes {onPublicList} {showClaimForOwner} {showFor} {user} />
    </div>
</div>

<!-- Footer with buttons -->
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
