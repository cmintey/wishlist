<script lang="ts">
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import Image from "$lib/components/Image.svelte";
    import Markdown from "$lib/components/Markdown.svelte";
    import ClaimButtons from "./ClaimButtons.svelte";
    import ReorderButtons from "./ReorderButtons.svelte";
    import { formatPrice } from "$lib/price-formatter";
    import type { MessageFormatter } from "$lib/server/i18n";

    interface Props {
        item: ItemOnListDTO;
        user?: PartialUser;
        showClaimedName?: boolean;
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
        defaultImage: (t: MessageFormatter) => any;
        id: string;
    }

    const {
        item,
        user,
        showClaimedName = false,
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
        defaultImage,
        id
    }: Props = $props();

    const t = getFormatter();

    const imageUrl: string | undefined = $derived.by(() => {
        if (item.imageUrl) {
            try {
                new URL(item.imageUrl);
                return item.imageUrl;
            } catch {
                if (item.imageUrl.startsWith("/") || item.imageUrl.endsWith("/")) {
                    return;
                }
                return `/api/assets/${item.imageUrl}`;
            }
        }
    });
</script>

<header class="card-header flex w-full px-4 pt-4">
    {#if item.url}
        <a
            id={`${id}-name`}
            class="line-clamp-2 text-xl font-bold dark:!text-primary-200 md:text-2xl w-full"
            data-testid="name"
            href={item.url}
            onclick={(e) => e.stopPropagation()}
            rel="noreferrer"
            target="_blank"
        >
            {item.name}
        </a>
    {:else}
        <span 
            id={`${id}-name`} 
            class="line-clamp-2 text-xl font-bold md:text-2xl w-full" 
            data-testid="name"
        >
            {item.name}
        </span>
    {/if}
</header>

<div class="flex flex-row gap-x-4 p-4">
    <Image
        class="aspect-square h-24 w-24 rounded object-contain md:h-40 md:w-40"
        alt={item.name}
        data-testid="image"
        referrerpolicy="no-referrer"
        src={imageUrl}
    >
        {@render defaultImage($t)}
    </Image>

    <div class="flex flex-col">
        <!-- Price with fallback -->
        <div class="flex items-center gap-x-2">
            <iconify-icon icon="ion:pricetag"></iconify-icon>
            <span class="text-lg font-semibold" data-testid="price">
                {#if item.price || item.itemPrice}
                    {formatPrice(item)}
                {:else}
                    ???
                {/if}
            </span>
        </div>

        <!-- Quantity with fallback -->
        <div class="grid grid-cols-[auto_1fr] items-center gap-2 text-base md:text-lg" data-testid="quantity">
            <iconify-icon icon="ion:gift"></iconify-icon>
            <div class="flex flex-row flex-wrap gap-x-2">
                <span data-testid="quantity-desired">
                    {#if item.quantity}
                        {$t("wishes.quantity-desired", { values: { quantity: item.quantity } })}
                    {:else}
                        unlimited
                    {/if}
                </span>
                {#if user?.id !== item.userId && item.quantity}
                    <span>·</span>
                    <span class="text-secondary-700-200-token font-bold" data-testid="quantity-claimed">
                        {$t("wishes.quantity-claimed", { values: { quantity: item.claimedQuantity } })}
                    </span>
                {/if}
            </div>
        </div>

        <div class="flex items-center gap-2">
            <iconify-icon icon="ion:person"></iconify-icon>
            <span class="text-wrap text-base md:text-lg" data-testid="added-by">
                {#if showFor}
                    {@html $t("wishes.for", { values: { name: item.user.name } })}
                {:else if !onPublicList}
                    {@html $t("wishes.added-by", { values: { name: item.addedBy.name } })}
                {:else}
                    {@html item.addedBy.id === item.user.id
                        ? $t("wishes.added-by", { values: { name: item.addedBy.name } })
                        : $t("wishes.added-by-somebody-else")}
                {/if}
            </span>
        </div>

        {#if item.note}
            <div class="grid flex-none grid-cols-[auto_1fr] items-center gap-2">
                <iconify-icon icon="ion:reader"></iconify-icon>
                <div class="line-clamp-2 whitespace-pre-wrap" data-testid="notes">
                    <Markdown source={item.note} />
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- Footer with buttons -->
<footer class="card-footer flex flex-row px-4 pb-4" class:justify-between={!reorderActions} class:justify-center={reorderActions}>
    {#if reorderActions}
        <ReorderButtons {item} {onDecreasePriority} {onIncreasePriority} />
    {:else}
        <div class="flex items-center gap-x-2">
            <ClaimButtons
                {item}
                onClaim={onClaim}
                {onPublicList}
                onPurchase={onPurchased}
                onUnclaim={onUnclaim}
                showName={showClaimedName}
                {user}
            />
        </div>

        <!-- Edit and Delete buttons on the right -->
        <div class="flex items-center gap-x-2">
            {#if item.approved && (user?.id === item.user?.id || user?.id === item.addedBy?.id)}
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
