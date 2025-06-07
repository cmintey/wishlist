<script lang="ts">
    import { melt } from "@melt-ui/svelte";
    import StatsModal from "$lib/components/modals/StatsModal.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";

    interface Props {
        items: ItemOnListDTO[];
    }

    const { items }: Props = $props();
</script>

<StatsModal {items}>
    {#snippet trigger(trigger)}
        <div>
            <button
                class="variant-glass-primary btn btn-icon btn-icon-sm"
                aria-label="Stats"
                title="Stats"
                use:melt={trigger}
            >
                <iconify-icon icon="ion:stats-chart"></iconify-icon>
            </button>
        </div>
    {/snippet}
</StatsModal>
