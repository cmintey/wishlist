<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { createEventDispatcher } from "svelte";
	import type { FullItem, PartialUser } from "./ItemCard.svelte";

	export let item: FullItem;
	export let user: PartialUser;

	const dispatch = createEventDispatcher();
</script>

<div class="flex flex-row space-x-2 md:space-x-4">
	{#if !item.approved}
		<button class="variant-filled-success btn btn-sm md:btn" on:click={() => dispatch("approve")}>
			Approve
		</button>
		<button class="variant-filled-error btn btn-sm md:btn" on:click={() => dispatch("deny")}>
			Deny
		</button>
	{:else if user.username === item.user?.username || user.username === item.addedBy?.username}
		<button
			class="variant-ghost-primary btn btn-sm md:btn"
			on:click={() => goto(`/wishlists/${item.user?.username}/edit/${item.id}?ref=${$page.url}`)}
		>
			Edit
		</button>
		<button class="variant-filled-error btn btn-sm md:btn" on:click={() => dispatch("delete")}>
			Delete
		</button>
	{/if}
</div>
