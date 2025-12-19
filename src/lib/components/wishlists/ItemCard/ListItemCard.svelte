<script lang="ts">
    import type { InternalItemCardProps } from "./ItemCard.svelte";
    import type { MessageFormatter } from "$lib/server/i18n";
    import ItemNameHeader from "./components/ItemNameHeader.svelte";
    import ItemAttributes from "./components/ItemAttributes.svelte";
    import ItemFooter from "./components/ItemFooter.svelte";
    import ItemImage from "./components/ItemImage.svelte";

    const { defaultImage: _defaultImage, ...props }: InternalItemCardProps = $props();
</script>

<ItemNameHeader {...props} />

<div class="flex flex-row gap-x-4 p-4">
    <ItemImage class="aspect-square h-24 w-24 rounded object-contain md:h-40 md:w-40" {...props} shrinkBadge>
        {#snippet defaultImage(t: MessageFormatter)}
            {@render _defaultImage(t, "aspect-square size-24 rounded md:size-40")}
        {/snippet}
    </ItemImage>

    <div class="flex flex-col">
        <ItemAttributes {...props} />
    </div>
</div>

<!-- Footer with buttons -->
<ItemFooter {...props} />
