<script lang="ts">
	import type { PageData } from "./$types";
	import ItemCard from "$lib/components/ItemCard.svelte";

	export let data: PageData;
</script>

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
