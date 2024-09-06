<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { FullItem, PartialUser } from "./ItemCard.svelte";

    export let item: FullItem;
    export let user: PartialUser | undefined;

    const dispatch = createEventDispatcher();
</script>

<div class="flex flex-row space-x-2 md:space-x-4">
    {#if !item.approved}
        <button class="variant-filled-success btn btn-sm md:btn" on:click|stopPropagation={() => dispatch("approve")}>
            Approve
        </button>
        <button class="variant-filled-error btn btn-sm md:btn" on:click|stopPropagation={() => dispatch("deny")}>
            Deny
        </button>
    {:else if user?.username === item.user?.username || user?.username === item.addedBy?.username}
        <button class="variant-ghost-primary btn btn-sm md:btn" on:click|stopPropagation={() => dispatch("edit")}>
            Edit
        </button>
        <button class="variant-filled-error btn btn-sm md:btn" on:click|stopPropagation={() => dispatch("delete")}>
            Delete
        </button>
    {/if}
</div>
