<script lang="ts">
    import { page } from "$app/stores";
    import { createEventDispatcher } from "svelte";
    import type { FullItem, PartialUser } from "./ItemCard.svelte";

    export let item: FullItem;
    export let user: PartialUser | undefined;
    export let showName: boolean;
    export let onPublicList = false;

    const dispatch = createEventDispatcher();
</script>

{#if !onPublicList && user?.username === $page.params?.username}
    <div />
{:else if item.pledgedBy || item.publicPledgedBy}
    {#if !onPublicList && item.pledgedBy?.username === user?.username}
        <div class="flex flex-row space-x-2 md:space-x-4">
            <button
                class="variant-ghost-secondary btn btn-sm md:btn"
                on:click|stopPropagation={() => dispatch("unclaim")}
            >
                Unclaim
            </button>
            <label class="unstyled flex items-center space-x-2 text-sm md:text-base">
                <input
                    class="checkbox"
                    type="checkbox"
                    bind:checked={item.purchased}
                    on:change={(event) => dispatch("purchase", { purchased: event.currentTarget?.checked })}
                    on:click|stopPropagation
                />
                <span>Purchased</span>
            </label>
        </div>
    {:else if showName}
        <span>Claimed by {item.publicPledgedBy ? item.publicPledgedBy?.name : item.pledgedBy?.name}</span>
    {:else}
        <span>Claimed</span>
    {/if}
{:else}
    <button class="variant-filled-secondary btn btn-sm md:btn" on:click|stopPropagation={() => dispatch("claim")}>
        Claim
    </button>
{/if}
