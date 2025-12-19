<script lang="ts">
    import type { InternalItemCardProps } from "./ItemCard.svelte";
    import ItemNameHeader from "./components/ItemNameHeader.svelte";
    import ItemAttributes from "./components/ItemAttributes.svelte";
    import ItemFooter from "./components/ItemFooter.svelte";
    import ItemImage from "./components/ItemImage.svelte";

    const { defaultImage: _defaultImage, ...props }: InternalItemCardProps = $props();
</script>

<div class="flex h-full flex-col">
    <!-- Image extends to card edges -->
    <div class="relative h-48 w-full overflow-hidden p-px">
        <ItemImage class="rounded-tl-container rounded-tr-container h-full w-full object-cover" item={props.item}>
            {#snippet defaultImage(t)}
                {@render _defaultImage(t, "rounded-tl-container rounded-tr-container  h-full w-full")}
            {/snippet}
        </ItemImage>
    </div>

    <!-- Title below image -->
    <ItemNameHeader {...props} />

    <!-- Content area with consistent padding -->
    <div class="flex flex-1 flex-col space-y-1 p-4">
        <ItemAttributes {...props} />
    </div>

    <ItemFooter {...props} />
</div>
