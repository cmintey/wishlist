<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { PartialUser } from "./ItemCard.svelte";
    import { t } from "svelte-i18n";
    import type { ItemOnListDTO, ClaimDTO } from "$lib/dtos/item-dto";

    interface Props {
        item: ItemOnListDTO;
        user: PartialUser | undefined; // logged in user
        showName: boolean;
        onPublicList?: boolean;
    }

    let { item = $bindable(), user, showName, onPublicList = false }: Props = $props();

    const dispatch = createEventDispatcher();

    const shouldShowName = (claim: ClaimDTO) => {
        return (
            (showName && onPublicList && claim.publicClaimedBy?.name) ||
            (user && claim.claimedBy?.groups.includes(user.activeGroupId) && claim.claimedBy?.name)
        );
    };
</script>

{#if !onPublicList && item.userId === user?.id}
    <div></div>
{:else if item.claims.length > 0}
    {@const claim = item.claims[0]}
    {#if !onPublicList && claim.claimedBy?.id === user?.id}
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
                    bind:checked={claim.purchased}
                />
                <span>{$t("wishes.purchased")}</span>
            </label>
        </div>
    {:else if shouldShowName(claim)}
        <span>
            {$t("wishes.claimed-by", {
                values: { name: claim.publicClaimedBy ? claim.publicClaimedBy.name : claim.claimedBy.name }
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
