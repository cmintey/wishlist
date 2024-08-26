<script lang="ts">
    export let reordering: boolean;
    export let onFinalize: VoidFunction;
</script>

<div>
    {#if reordering}
        <button class="variant-ghost-secondary chip" on:click={onFinalize}>Finish</button>
    {:else}
        <button class="variant-filled-primary chip" on:click={() => (reordering = true)}>Reorder</button>
    {/if}
</div>
