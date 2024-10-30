<script lang="ts">
    import { page } from "$app/stores";
    import { createEventDispatcher } from "svelte";
    import type { FullItem, PartialUser } from "./ItemCard.svelte";

    interface Props {
        item: FullItem;
        user: PartialUser | undefined;
        showName: boolean;
        onPublicList?: boolean;
    }

    let { item = $bindable(), user, showName, onPublicList = false }: Props = $props();

    const dispatch = createEventDispatcher();
</script>

{#if !onPublicList && user?.username === $page.params?.username}
    <div></div>
{:else if item.pledgedBy || item.publicPledgedBy}
    {#if !onPublicList && item.pledgedBy?.username === user?.username}
        <div class="flex flex-row space-x-2 md:space-x-4">
            <button
                class="variant-ghost-secondary btn btn-sm md:btn"
                onclick={(e) => {
                    e.stopPropagation();
                    dispatch("unclaim");
                }}
            >
                Unclaim
            </button>
            <label class="unstyled flex items-center space-x-2 text-sm md:text-base">
                <input
                    class="checkbox"
                    onchange={(event) => dispatch("purchase", { purchased: event.currentTarget?.checked })}
                    onclick={(e) => e.stopPropagation()}
                    type="checkbox"
                    bind:checked={item.purchased}
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
    <button
        class="variant-filled-secondary btn btn-sm md:btn"
        onclick={(e) => {
            e.stopPropagation();
            dispatch("claim");
        }}
    >
        Claim
    </button>
{/if}
