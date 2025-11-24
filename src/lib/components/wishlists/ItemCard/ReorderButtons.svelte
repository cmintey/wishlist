<script lang="ts">
    import { dragHandle } from "svelte-dnd-action";
    import { getFormatter } from "$lib/i18n";
    import { getListViewPreference } from "$lib/stores/list-view-preference.svelte";
    import type { InternalItemCardProps } from "./ItemCard.svelte";

    type Props = Pick<InternalItemCardProps, "item" | "onIncreasePriority" | "onDecreasePriority">;

    const { item, onIncreasePriority, onDecreasePriority }: Props = $props();
    const t = getFormatter();

    let messageObj = $derived({ values: { name: item.name } });

    let isTileView = $derived(getListViewPreference() === "tile");
</script>

<div class={["flex w-max gap-x-4", isTileView && "flex-row-reverse"]}>
    <button
        class="variant-outline-primary btn btn-icon btn-icon-sm md:btn-icon"
        aria-label={$t("a11y.decrease-priority", messageObj)}
        onclick={(e) => {
            e.stopPropagation();
            if (onDecreasePriority) onDecreasePriority(item.id);
        }}
    >
        <iconify-icon class={[isTileView && "-rotate-90"]} icon="ion:arrow-down"></iconify-icon>
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
        <iconify-icon class={[isTileView && "-rotate-90"]} icon="ion:arrow-up"></iconify-icon>
    </button>
</div>
