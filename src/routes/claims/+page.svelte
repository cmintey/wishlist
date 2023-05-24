<script lang="ts">
	import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";
	import { flip } from "svelte/animate";
	import type { PageData } from "./$types";
	import ItemCard from "$lib/components/wishlists/ItemCard.svelte";

	export let data: PageData;

	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),

		fallback(node) {
			const style = getComputedStyle(node);
			const transform = style.transform === "none" ? "" : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});

	$: items = data.items;
</script>

<h1 class="h1 pb-4">My Claims</h1>

{#if data.items.length === 0}
	<div>
		<p>No items yet</p>
	</div>
{:else}
	<div class="flex flex-col space-y-4">
		{#each items.filter((item) => !item.purchased) as item (item.id)}
			<div
				in:receive={{ key: item.id }}
				out:send|local={{ key: item.id }}
				animate:flip={{ duration: 200 }}
			>
				<ItemCard {item} showFor user={data.user} />
			</div>
		{/each}
		{#each items.filter((item) => item.purchased) as item (item.id)}
			<div
				in:receive={{ key: item.id }}
				out:send|local={{ key: item.id }}
				animate:flip={{ duration: 200 }}
			>
				<ItemCard {item} showFor user={data.user} />
			</div>
		{/each}
	</div>
{/if}

<svelte:head>
	<title>My Claims</title>
</svelte:head>
