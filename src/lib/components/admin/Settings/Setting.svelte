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
        <span class="subtext">
            {@render description()}
        </span>
    {/if}
</div>
