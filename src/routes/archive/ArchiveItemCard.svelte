<script lang="ts">
    import Markdown from "$lib/components/Markdown.svelte";
    import ItemImage from "$lib/components/wishlists/ItemCard/components/ItemImage.svelte";
    import ItemNameHeader from "$lib/components/wishlists/ItemCard/components/ItemNameHeader.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";
    import { formatNumberAsPrice } from "$lib/price-formatter";
    import type { MessageFormatter } from "$lib/server/i18n";
    import type { ClassValue } from "svelte/elements";
    import type { PageData } from "./$types";

    interface Props {
        item: PageData["items"][number];
        isTileView: boolean;
        pending: boolean;
        onrestore: (id: number) => void;
    }

    const { item, isTileView, pending, onrestore }: Props = $props();
    const t = getFormatter();
    const id = $props.id();

    // These two presentation components only read name, URL, imageUrl and mostWanted.
    // The archive projection provides those fields without inventing a list or claims DTO.
    const cardItem = $derived(item as unknown as ItemOnListDTO);
</script>

{#snippet placeholderImage(t: MessageFormatter, sizeClasses: ClassValue)}
    <div
        class={["bg-surface-300-700 grid flex-none place-items-center", sizeClasses]}
        aria-label={t("a11y.default-item-image")}
        data-testid="image"
        role="img"
    >
        <iconify-icon class="size-8 md:size-16" height="none" icon="ion:gift"></iconify-icon>
    </div>
{/snippet}

{#snippet image()}
    {#if isTileView}
        <div class="relative h-48 w-full overflow-hidden">
            <ItemImage class="h-full w-full rounded-t-[calc(var(--radius-container)-1px)] object-cover" item={cardItem}>
                {#snippet defaultImage(t)}
                    {@render placeholderImage(t, "rounded-t-[calc(var(--radius-container)-1px)] h-full w-full")}
                {/snippet}
            </ItemImage>
        </div>
    {:else}
        <ItemImage class="aspect-square h-24 w-24 rounded object-contain md:h-40 md:w-40" item={cardItem} shrinkBadge>
            {#snippet defaultImage(t)}
                {@render placeholderImage(t, "aspect-square size-24 rounded md:size-40")}
            {/snippet}
        </ItemImage>
    {/if}
{/snippet}

{#snippet attributes()}
    {#if item.price || item.itemPrice}
        <div class="flex items-center gap-x-2">
            <iconify-icon icon="ion:pricetag"></iconify-icon>
            <span data-testid="price">
                {item.itemPrice ? formatNumberAsPrice(item.itemPrice.currency, item.itemPrice.value) : item.price}
            </span>
        </div>
    {/if}
    <div class="flex items-center gap-2" data-testid="quantity">
        <iconify-icon icon="ion:gift"></iconify-icon>
        <span data-testid="quantity-desired">
            {item.quantity === null
                ? $t("wishes.no-limit")
                : $t("wishes.quantity-desired", { values: { quantity: item.quantity } })}
        </span>
    </div>
    <div class="flex items-center gap-2">
        <iconify-icon icon="ion:person"></iconify-icon>
        <span data-testid="added-by">{$t("archive.for", { values: { name: item.user.name } })}</span>
    </div>
    {#if item.note}
        <div class="grid grid-cols-[auto_1fr] items-center gap-2">
            <iconify-icon icon="ion:reader"></iconify-icon>
            <div class="whitespace-pre-wrap" data-testid="notes"><Markdown source={item.note} /></div>
        </div>
    {/if}
    {#if item.claims.length}
        <ul class="mt-2">
            {#each item.claims as claim}
                <li>
                    {$t("archive.claim", {
                        values: {
                            name: claim.name || $t("wishes.anonymous"),
                            quantity: claim.quantity
                        }
                    })}
                </li>
            {/each}
        </ul>
    {/if}
{/snippet}

<article
    class="card preset-filled-surface-100-900 border-surface-200-800 block h-full w-full border text-start print:break-inside-avoid print:shadow-none"
    aria-labelledby={`${id}-name`}
>
    {#if isTileView}
        <div class="flex h-full flex-col">
            {@render image()}
            <ItemNameHeader {id} item={cardItem} />
            <div class="flex flex-1 flex-col space-y-1 p-4">{@render attributes()}</div>
            {#if item.canRestore}
                <footer class="px-4 pb-4 print:hidden">
                    <button class="btn preset-tonal-primary" disabled={pending} onclick={() => onrestore(item.id)}>
                        {$t("archive.restore")}
                    </button>
                </footer>
            {/if}
        </div>
    {:else}
        <ItemNameHeader {id} item={cardItem} />
        <div class="flex flex-row gap-x-4 p-4 print:pt-1">
            {@render image()}
            <div class="flex min-w-0 flex-col">{@render attributes()}</div>
        </div>
        {#if item.canRestore}
            <footer class="px-4 pb-4 print:hidden">
                <button class="btn preset-tonal-primary" disabled={pending} onclick={() => onrestore(item.id)}>
                    {$t("archive.restore")}
                </button>
            </footer>
        {/if}
    {/if}
</article>
