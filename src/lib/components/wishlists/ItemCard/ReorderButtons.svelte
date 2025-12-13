<script lang="ts">
    import { dragHandle } from "svelte-dnd-action";
    import { getFormatter } from "$lib/i18n";
    import { getListViewPreference } from "$lib/stores/list-view-preference.svelte";
    import type { InternalItemCardProps } from "./ItemCard.svelte";

    type Props = Pick<InternalItemCardProps, "item" | "onIncreasePriority" | "onDecreasePriority" | "onPriorityChange">;

    const { item, onIncreasePriority, onDecreasePriority, onPriorityChange }: Props = $props();
    const t = getFormatter();

    let messageObj = $derived({ values: { name: item.name } });

    let isTileView = $derived(getListViewPreference() === "tile");
</script>

<div class="flex flex-col">
    <div class={["flex w-max items-center gap-x-2", isTileView && "md:flex-row-reverse"]}>
        <button
            class="variant-outline-primary btn btn-icon btn-icon-sm size-[33px] md:btn-icon md:size-[43px]"
            aria-label={$t("a11y.decrease-priority", messageObj)}
            onclick={(e) => {
                e.stopPropagation();
                if (onDecreasePriority) onDecreasePriority(item.id);
            }}
            title={$t("a11y.decrease-priority", messageObj)}
        >
            <iconify-icon class={[isTileView && "md:-rotate-90"]} icon="ion:arrow-down"></iconify-icon>
        </button>
        <div>
            <label class="sr-only" for="displayOrder">{$t("wishes.display-order")}</label>
            <input
                id={item.id + "-displayOrder"}
                class="input h-[33px] w-16 text-center text-sm md:h-[43px] md:text-base"
                inputmode="numeric"
                onchange={(e) => onPriorityChange?.(item, e.currentTarget.value)}
                pattern="/d*"
                value={item.displayOrder !== null ? item.displayOrder + 1 : null}
            />
        </div>
        <button
            class="variant-outline-primary btn btn-icon btn-icon-sm size-[33px] md:btn-icon md:size-[43px]"
            aria-label={$t("a11y.increase-priority", messageObj)}
            onclick={(e) => {
                e.stopPropagation();
                if (onIncreasePriority) onIncreasePriority(item.id);
            }}
            title={$t("a11y.increase-priority", messageObj)}
        >
            <iconify-icon class={[isTileView && "md:-rotate-90"]} icon="ion:arrow-up"></iconify-icon>
        </button>
    </div>

    <button
        class="btn btn-sm w-full"
        aria-label={$t("a11y.drag-handle", messageObj)}
        onclick={(e) => e.stopPropagation()}
        title={$t("a11y.drag-handle", messageObj)}
        use:dragHandle
    >
        <iconify-icon icon="ion:reorder-two"></iconify-icon>
    </button>
</div>
