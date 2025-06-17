<script lang="ts">
    import type { Snippet } from "svelte";
    import type { SvelteMarkdownOptions } from "@humanspeak/svelte-markdown";

    interface Props {
        depth: number;
        raw: string;
        text: string;
        options: SvelteMarkdownOptions;
        slug: (val: string) => string;
        children?: Snippet;
    }

    const { depth, raw, text, options, slug, children }: Props = $props();

    const id = $derived(options.headerIds ? options.headerPrefix + slug(text) : undefined);
</script>

{#if depth === 1}
    <h1 {id} class="h1">{@render children?.()}</h1>
{:else if depth === 2}
    <h2 {id} class="h2">{@render children?.()}</h2>
{:else if depth === 3}
    <h3 {id} class="h3">{@render children?.()}</h3>
{:else if depth === 4}
    <h4 {id} class="h4">{@render children?.()}</h4>
{:else if depth === 5}
    <h5 {id} class="h5">{@render children?.()}</h5>
{:else if depth === 6}
    <h6 {id} class="h6">{@render children?.()}</h6>
{:else}
    {raw}
{/if}
