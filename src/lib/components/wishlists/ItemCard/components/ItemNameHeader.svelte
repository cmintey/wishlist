<script lang="ts">
    import { getComponentId, getItem } from "../context";

    const id = getComponentId();
    const item = getItem();
</script>

<header class="card-header flex w-full px-4 pt-4">
    {#if item.url}
        <a
            id={`${id}-name`}
            class="line-clamp-1 w-full text-left text-xl font-bold dark:!text-primary-200 md:text-2xl"
            data-testid="name"
            href={item.url}
            onclick={(e) => e.stopPropagation()}
            rel="noreferrer"
            target="_blank"
        >
            {item.name}
        </a>
    {:else}
        <span id={`${id}-name`} class="line-clamp-1 w-full text-left text-xl font-bold md:text-2xl" data-testid="name">
            {item.name}
        </span>
    {/if}
</header>
