<script lang="ts" module>
    export type ItemVoidFunction = (itemId: number) => void;
</script>

<script lang="ts">
    import { dragHandle } from "svelte-dnd-action";
    import type { FullItem } from "./ItemCard.svelte";

    interface Props {
        item: FullItem;
        onIncreasePriority?: ItemVoidFunction | undefined;
        onDecreasePriority?: ItemVoidFunction | undefined;
    }

    let { item, onIncreasePriority = undefined, onDecreasePriority = undefined }: Props = $props();
</script>

<div class="w-max space-x-4">
    <button
        class="variant-outline-primary btn btn-icon btn-icon-sm md:btn-icon"
        aria-label="lower priority for {item.name}"
        onclick={(e) => {
            e.stopPropagation();
            if (onDecreasePriority) onDecreasePriority(item.id);
        }}
    >
        <iconify-icon icon="ion:arrow-down"></iconify-icon>
    </button>
    <button
        class="variant-outline-primary btn md:btn-lg"
        aria-label="drag-handle for {item.name}"
        onclick={(e) => e.stopPropagation()}
        use:dragHandle
    >
        <iconify-icon icon="ion:reorder-two"></iconify-icon>
    </button>
    <button
        class="variant-outline-primary btn btn-icon btn-icon-sm md:btn-icon"
        aria-label="increase priority for {item.name}"
        onclick={(e) => {
            e.stopPropagation();
            if (onIncreasePriority) onIncreasePriority(item.id);
        }}
    >
        <iconify-icon icon="ion:arrow-up"></iconify-icon>
    </button>
</div>
