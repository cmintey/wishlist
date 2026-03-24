<script lang="ts">
    import SvelteMarkdown from "@humanspeak/svelte-markdown";

    interface Props {
        source: string;
    }

    const { source }: Props = $props();
</script>

<SvelteMarkdown options={{ headerIds: false }} {source}>
    {#snippet heading({ depth, raw, text, options, slug, children })}
        {@const id = options.headerIds ? options.headerPrefix + slug(text) : undefined}
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
    {/snippet}

    {#snippet list({ ordered, start, children })}
        {#if ordered}
            <ol class="list-decimal pl-4 rtl:pr-4" {start}>{@render children?.()}</ol>
        {:else}
            <ul class="list-disc pl-4 rtl:pr-4">{@render children?.()}</ul>
        {/if}
    {/snippet}

    {#snippet link({ href, title, children })}
        <a class="anchor" {href} onclick={(e) => e.stopPropagation()} {title}>{@render children?.()}</a>
    {/snippet}
</SvelteMarkdown>
