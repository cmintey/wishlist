<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { FullItem, PartialUser } from "./ItemCard.svelte";

    interface Props {
        item: FullItem;
        user: PartialUser | undefined;
    }

    let { item, user }: Props = $props();

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
            Approve
        </button>
        <button
            class="variant-filled-error btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                dispatch("deny");
            }}
        >
            Deny
        </button>
    {:else if user?.username === item.user?.username || user?.username === item.addedBy?.username}
        <button
            class="variant-ghost-primary btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                dispatch("edit");
            }}
        >
            Edit
        </button>
        <button
            class="variant-filled-error btn btn-sm md:btn"
            onclick={(e) => {
                e.stopPropagation();
                dispatch("delete");
            }}
        >
            Delete
        </button>
    {/if}
</div>
