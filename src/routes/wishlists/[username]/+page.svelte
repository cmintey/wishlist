<script lang="ts">
	import type { PageData } from "./$types";
	import ItemCard from "$lib/components/ItemCard.svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";

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

<button
	class="btn btn-filled w-16 h-16 rounded-full fixed z-90 bottom-10 right-8"
	on:click={() => goto(`${$page.url}/new`)}
>
	<iconify-icon icon="ri:add-fill" width="32" height="32" />
</button>
