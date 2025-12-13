<script lang="ts">
    import Icon from "$lib/components/Icon.svelte";
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
            <Icon icon="ion--checkmark"></Icon>
            <span>{$t("wishes.finish")}</span>
        </button>
    {:else}
        <button class="variant-filled-primary chip" onclick={() => (reordering = true)}>
            <Icon icon="ion--reorder-four"></Icon>
            <span>{$t("wishes.reorder")}</span>
        </button>
    {/if}
</div>
