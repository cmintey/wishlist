<script lang="ts" module>
    export type ItemVoidFunction = (itemId: number) => void;
</script>

<script lang="ts">
    import { dragHandle } from "svelte-dnd-action";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        item: ItemOnListDTO;
        onIncreasePriority?: ItemVoidFunction | undefined;
        onDecreasePriority?: ItemVoidFunction | undefined;
    }

    const { item, onIncreasePriority = undefined, onDecreasePriority = undefined }: Props = $props();
    const t = getFormatter();

    let messageObj = $derived({ values: { name: item.name } });
</script>

<div class="w-max gap-x-4">
    <button
        class="variant-outline-primary btn btn-icon btn-icon-sm md:btn-icon"
        aria-label={$t("a11y.decrease-priority", messageObj)}
        onclick={(e) => {
            e.stopPropagation();
            if (onDecreasePriority) onDecreasePriority(item.id);
        }}
    >
        <iconify-icon icon="ion:arrow-down"></iconify-icon>
    </button>
    <button
        class="variant-outline-primary btn md:btn-lg"
        aria-label={$t("a11y.drag-handle", messageObj)}
        onclick={(e) => e.stopPropagation()}
        use:dragHandle
    >
        <iconify-icon icon="ion:reorder-two"></iconify-icon>
    </button>
    <button
        class="variant-outline-primary btn btn-icon btn-icon-sm md:btn-icon"
        aria-label={$t("a11y.increase-priority", messageObj)}
        onclick={(e) => {
            e.stopPropagation();
            if (onIncreasePriority) onIncreasePriority(item.id);
        }}
    >
        <iconify-icon icon="ion:arrow-up"></iconify-icon>
    </button>
</div>
