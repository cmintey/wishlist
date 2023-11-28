<script lang="ts">
	import { page } from "$app/stores";
	import { createEventDispatcher } from "svelte";
	import type { FullItem, PartialUser } from "./ItemCard.svelte";

	export let item: FullItem;
	export let user: PartialUser;

	const dispatch = createEventDispatcher();
</script>

{#if user.username === $page.params.username}
	<div />
{:else if item.pledgedBy}
	{#if item.pledgedBy.username === user.username}
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
	{:else}
		<span>Claimed by {item.pledgedBy?.name}</span>
	{/if}
{:else}
	<button
		class="variant-filled-secondary btn btn-sm md:btn"
		on:click|stopPropagation={() => dispatch("claim")}
	>
		Claim
	</button>
{/if}
