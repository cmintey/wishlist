<script lang="ts">
    import { getFormatter } from "$lib/i18n";

    interface Props {
        reordering: boolean;
        onFinalize: VoidFunction;
    }

    let { reordering = $bindable(), onFinalize }: Props = $props();
    const t = getFormatter();
</script>

<div>
    {#if reordering}
        <button class="variant-ghost-secondary chip" onclick={onFinalize}>
            <iconify-icon icon="ion:checkmark"></iconify-icon>
            <span>{$t("wishes.finish")}</span>
        </button>
    {:else}
        <button class="variant-filled-primary chip" onclick={() => (reordering = true)}>
            <iconify-icon icon="ion:reorder-four"></iconify-icon>
            <span>{$t("wishes.reorder")}</span>
        </button>
    {/if}
</div>
