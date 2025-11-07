<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        class?: ClassValue;
        description?: Snippet;
        children: Snippet;
    }

    const { description, children, ...props }: Props = $props();
</script>

<div {...props}>
    {@render children()}
    {#if description}
        <span class="subtext">
            {@render description()}
        </span>
    {/if}
</div>
