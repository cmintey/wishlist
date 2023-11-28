<script lang="ts">
	import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";
	import { flip } from "svelte/animate";
	import type { PageData } from "./$types";
	import ItemCard from "$lib/components/wishlists/ItemCard/ItemCard.svelte";
	import noClaims from "$lib/assets/no_claims.svg";

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

{#if data.items.length === 0}
	<div class="flex flex-col items-center justify-center space-y-4 pt-4">
		<img class="w-3/4 md:w-1/3" alt="A person looking at an empty board" src={noClaims} />
		<p class="text-2xl">Nothing claimed yet</p>
	</div>
{:else}
	<div class="flex flex-col space-y-4">
		{#each items.filter((item) => !item.purchased) as item (item.id)}
			<div
				in:receive={{ key: item.id }}
				out:send|local={{ key: item.id }}
				animate:flip={{ duration: 200 }}
			>
				<ItemCard {item} showClaimedName showFor user={data.user} />
			</div>
		{/each}
		{#each items.filter((item) => item.purchased) as item (item.id)}
			<div
				in:receive={{ key: item.id }}
				out:send|local={{ key: item.id }}
				animate:flip={{ duration: 200 }}
			>
				<ItemCard {item} showClaimedName showFor user={data.user} />
			</div>
		{/each}
	</div>
{/if}

<svelte:head>
	<title>My Claims</title>
</svelte:head>
