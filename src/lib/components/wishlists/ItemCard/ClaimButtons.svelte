<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { FullItem, PartialUser } from "./ItemCard.svelte";
    import { t } from "svelte-i18n";

    interface Props {
        item: FullItem;
        user: PartialUser | undefined;
        showName: boolean;
        onPublicList?: boolean;
    }

    let { item = $bindable(), user, showName, onPublicList = false }: Props = $props();

    const dispatch = createEventDispatcher();
</script>

{#if !onPublicList && item.userId === user?.id}
    <div></div>
{:else if item.pledgedBy || item.publicPledgedBy}
    {#if !onPublicList && item.pledgedBy?.id === user?.id}
        <div class="flex flex-row space-x-2 md:space-x-4">
            <button
                class="variant-ghost-secondary btn btn-sm md:btn"
                onclick={(e) => {
                    e.stopPropagation();
                    dispatch("unclaim");
                }}
            >
                {$t("wishes.unclaim")}
            </button>
            <label class="unstyled flex items-center space-x-2 text-sm md:text-base">
                <input
                    class="checkbox"
                    onchange={(event) => dispatch("purchase", { purchased: event.currentTarget?.checked })}
                    onclick={(e) => e.stopPropagation()}
                    type="checkbox"
                    bind:checked={item.purchased}
                />
                <span>{$t("wishes.purchased")}</span>
            </label>
        </div>
    {:else if showName}
        <span>
            {$t("wishes.claimed-by", {
                values: { name: item.publicPledgedBy ? item.publicPledgedBy?.name : item.pledgedBy?.name }
            })}
        </span>
    {:else}
        <span>{$t("wishes.claimed")}</span>
    {/if}
{:else}
    <button
        class="variant-filled-secondary btn btn-sm md:btn"
        onclick={(e) => {
            e.stopPropagation();
            dispatch("claim");
        }}
    >
        {$t("wishes.claim")}
    </button>
{/if}
