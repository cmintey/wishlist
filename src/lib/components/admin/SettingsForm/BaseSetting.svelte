<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        title: string;
        subtitle?: string;
        children: Snippet;
    }

    const { title, subtitle, children }: Props = $props();
</script>

<div class="flex flex-col space-y-2">
    <h2 class="h2">{title}</h2>
    {#if subtitle}
        <span>{subtitle}</span>
    {/if}
    {@render children()}
</div>
