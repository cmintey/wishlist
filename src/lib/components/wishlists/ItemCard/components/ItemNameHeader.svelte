<script lang="ts">
    import type { InternalItemCardProps } from "../ItemCard.svelte";

    const { id, item }: Pick<InternalItemCardProps, "id" | "item"> = $props();
</script>

<header class="card-header line-clamp-1 flex w-full px-4 pt-4 text-lg font-bold md:text-xl">
    {#if item.url}
        <a
            id={`${id}-name`}
            class="anchor dark:text-primary-200! line-clamp-1"
            data-testid="name"
            href={item.url}
            onclick={(e) => e.stopPropagation()}
            rel="noreferrer"
            target="_blank"
        >
            {item.name}
        </a>
    {:else}
        <span id={`${id}-name`} class="line-clamp-1" data-testid="name">
            {item.name}
        </span>
    {/if}
</header>
