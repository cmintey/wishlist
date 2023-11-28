<script lang="ts">
	import { getDrawerStore } from "@skeletonlabs/skeleton";
	import type { FullItem } from "./ItemCard/ItemCard.svelte";

	const drawerStore = getDrawerStore();
	const item: FullItem = $drawerStore.meta.item satisfies FullItem;
	const showFor: boolean = $drawerStore.meta.showFor;
</script>

<div class="flex flex-col space-y-2 p-4 pb-12">
	<div class="flex w-full justify-center">
		<hr class="self-c !w-12 !rounded !border-t-4" />
	</div>
	<span class="text-xl font-bold md:text-2xl">
		{item.name}
	</span>
	<div class="flex flex-row space-x-2 text-base md:text-lg">
		{#if item.price}
			<span class="font-semibold">{item.price}</span>
			<span>·</span>
		{/if}

		<span>
			{#if showFor}
				For <span class="text-secondary-700-200-token font-bold">{item.user?.name}</span>
			{:else}
				Added by <span class="text-secondary-700-200-token font-bold">{item.addedBy?.name}</span>
			{/if}
		</span>
	</div>
	<p class="whitespace-pre-wrap">{item.note}</p>
</div>
