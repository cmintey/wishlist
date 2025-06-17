<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        ordered?: boolean;
        start?: number;
        children?: Snippet;
    }

    const { ordered = false, start = 1, children }: Props = $props();
</script>

{#if ordered}
    <ol class="list-decimal pl-4" {start}>{@render children?.()}</ol>
{:else}
    <ul class="list-disc pl-4">{@render children?.()}</ul>
{/if}
