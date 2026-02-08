<script lang="ts">
    import type { InternalItemCardProps } from "../ItemCard.svelte";

    const { id, item }: Pick<InternalItemCardProps, "id" | "item"> = $props();
</script>

<header class="card-header line-clamp-1 flex w-full px-4 pt-4 text-lg font-bold md:text-xl print:line-clamp-none">
    {#if item.url}
        <a
            id={`${id}-name`}
            class="anchor text-primary-800-200 line-clamp-1 print:no-underline!"
            data-testid="name"
            href={item.url}
            onclick={(e) => e.stopPropagation()}
            rel="noreferrer"
            target="_blank"
        >
            {item.name}
        </a>
        <span class="hidden text-xs font-normal print:block">{item.url}</span>
    {:else}
        <span id={`${id}-name`} data-testid="name">
            {item.name}
        </span>
    {/if}
</header>
