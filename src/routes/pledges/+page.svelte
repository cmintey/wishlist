<script lang="ts">
	import type { PageData } from "./$types";
	import ItemCard from "$lib/components/wishlists/ItemCard.svelte";

	export let data: PageData;
</script>

<h1 class="pb-4">My Pledges</h1>

{#if data.items.length === 0}
	<div>
		<p>No items yet</p>
	</div>
{:else}
	<div class="flex flex-col space-y-4">
		{#each data.items as item}
			<ItemCard {item} user={data.user} />
		{/each}
	</div>
{/if}
