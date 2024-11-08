<script lang="ts">
    interface Props {
        reordering: boolean;
        onFinalize: VoidFunction;
    }

    let { reordering = $bindable(), onFinalize }: Props = $props();
</script>

<div>
    {#if reordering}
        <button class="variant-ghost-secondary chip" onclick={onFinalize}>Finish</button>
    {:else}
        <button class="variant-filled-primary chip" onclick={() => (reordering = true)}>Reorder</button>
    {/if}
</div>
