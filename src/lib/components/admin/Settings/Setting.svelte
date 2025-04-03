<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        description?: Snippet;
        children: Snippet;
    }

    const { description, children }: Props = $props();
</script>

<div>
    {@render children()}
    {#if description}
        <span class="text-sm text-surface-900/70 dark:text-surface-50/50">
            {@render description()}
        </span>
    {/if}
</div>
