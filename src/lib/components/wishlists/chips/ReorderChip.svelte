<script lang="ts">
    import { t } from "svelte-i18n";

    interface Props {
        reordering: boolean;
        onFinalize: VoidFunction;
    }

    let { reordering = $bindable(), onFinalize }: Props = $props();
</script>

<div>
    {#if reordering}
        <button class="variant-ghost-secondary chip" onclick={onFinalize}>{$t("wishes.finish")}</button>
    {:else}
        <button class="variant-filled-primary chip" onclick={() => (reordering = true)}>{$t("wishes.reorder")}</button>
    {/if}
</div>
