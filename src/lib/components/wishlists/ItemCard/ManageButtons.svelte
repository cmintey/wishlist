<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { PartialUser } from "./ItemCard.svelte";
    import type { ItemOnListDTO } from "$lib/dtos/item-dto";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        item: ItemOnListDTO;
        user: PartialUser | undefined;
    }

    const { item, user }: Props = $props();
    const t = getFormatter();

    const dispatch = createEventDispatcher();
</script>

<div class="flex flex-row space-x-2 md:space-x-4">
    {#if !item.approved}
        <button
            class="variant-filled-success btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                dispatch("approve");
            }}
        >
            {$t("wishes.approve")}
        </button>
        <button
            class="variant-filled-error btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                dispatch("deny");
            }}
        >
            {$t("wishes.deny")}
        </button>
    {:else if user?.id === item.user?.id || user?.id === item.addedBy?.id}
        <button
            class="variant-ghost-primary btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                dispatch("edit");
            }}
        >
            {$t("wishes.edit")}
        </button>
        <button
            class="variant-filled-error btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                dispatch("delete");
            }}
        >
            {$t("wishes.delete")}
        </button>
    {/if}
</div>
