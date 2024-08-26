<script context="module" lang="ts">
    export type ItemVoidFunction = (itemId: number) => void;
</script>

<script lang="ts">
    import { dragHandle } from "svelte-dnd-action";
    import type { FullItem } from "./ItemCard.svelte";

    export let item: FullItem;
    export let onIncreasePriority: ItemVoidFunction | undefined = undefined;
    export let onDecreasePriority: ItemVoidFunction | undefined = undefined;
</script>

<div class="w-max space-x-4">
    <button
        class="variant-outline-primary btn btn-icon btn-icon-sm md:btn-icon"
        aria-label="lower priority for {item.name}"
        on:click|stopPropagation={() => onDecreasePriority && onDecreasePriority(item.id)}
    >
        <iconify-icon icon="ion:arrow-down"></iconify-icon>
    </button>
    <button
        class="variant-outline-primary btn md:btn-lg"
        aria-label="drag-handle for {item.name}"
        on:click|stopPropagation={() => {}}
        use:dragHandle
    >
        <iconify-icon icon="ion:reorder-two"></iconify-icon>
    </button>
    <button
        class="variant-outline-primary btn btn-icon btn-icon-sm md:btn-icon"
        aria-label="increase priority for {item.name}"
        on:click|stopPropagation={() => onIncreasePriority && onIncreasePriority(item.id)}
    >
        <iconify-icon icon="ion:arrow-up"></iconify-icon>
    </button>
</div>
