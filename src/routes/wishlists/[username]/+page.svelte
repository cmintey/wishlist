<script lang="ts">
	import type { PageData } from "./$types";
	import ItemCard from "$lib/components/wishlists/ItemCard/ItemCard.svelte";
	import ClaimFilterChip from "$lib/components/wishlists/chips/ClaimFilter.svelte";
	import { goto, invalidate } from "$app/navigation";
	import { page } from "$app/stores";
	import { listen, idle } from "$lib/stores/idle";
	import { onDestroy, onMount } from "svelte";
	import { flip } from "svelte/animate";
	import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";
	import { isInstalled } from "$lib/stores/is-installed";
	import empty from "$lib/assets/no_wishes.svg";
	import SortBy from "$lib/components/wishlists/chips/SortBy.svelte";
	import { hash, hashItems, viewedItems } from "$lib/stores/viewed-items";

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

	// Poll for updates
	listen({
		timer: 5 * 60 * 1000 // 5 minutes
	});

	let polling = true;
	let pollTimeout: number;

	const pollUpdate = () => {
		if ($idle) {
			polling = false;
			return;
		}

		//@ts-expect-error setTimeout returns number in web
		pollTimeout = setTimeout(async () => {
			await invalidate("list:poll");
			pollUpdate();
		}, 5000);
	};

	onMount(async () => {
		const userHash = await hash(data.listOwner.id);
		$viewedItems[userHash] = await hashItems(data.items);
		pollUpdate();
	});
	onDestroy(() => clearTimeout(pollTimeout));

	$: if (!$idle && !polling) {
		polling = true;
		pollUpdate();
	}
</script>

{#if data.approvals.length > 0}
	<h2 class="h2 pb-2">Approvals</h2>
	<div class="flex flex-col space-y-4 pb-2">
		{#each data.approvals as item (item.id)}
			<div
				in:receive={{ key: item.id }}
				out:send|local={{ key: item.id }}
				animate:flip={{ duration: 200 }}
			>
				<ItemCard {item} showClaimedName={data.showClaimedName} user={data.user} />
			</div>
		{/each}
	</div>
	<hr class="pb-2" />
{/if}

{#if data.items.length === 0}
	<div class="flex flex-col items-center justify-center space-y-4 pt-4">
		<img class="w-3/4 md:w-1/3" alt="Two people looking in an empty box" src={empty} />
		<p class="text-2xl">No wishes yet</p>
	</div>
{:else}
	<!-- chips -->
	<div class="flex flex-row flex-wrap space-x-4">
		{#if !data.listOwner.isMe}
			<ClaimFilterChip />
		{/if}
		<SortBy />
	</div>

	<!-- items -->
	<div class="flex flex-col space-y-4">
		{#each data.items as item (item.id)}
			<div
				in:receive={{ key: item.id }}
				out:send|local={{ key: item.id }}
				animate:flip={{ duration: 200 }}
			>
				<ItemCard {item} showClaimedName={data.showClaimedName} user={data.user} />
			</div>
		{/each}
	</div>
	<footer>
		<div class="h-16" />
	</footer>
{/if}

<!-- Add Item button -->
{#if data.listOwner.isMe || data.suggestionsEnabled}
	<button
		class="z-90 variant-ghost-surface btn fixed right-4 h-16 w-16 rounded-full md:bottom-10 md:right-10 md:h-20 md:w-20"
		class:bottom-24={$isInstalled}
		class:bottom-4={!$isInstalled}
		on:click={() => goto(`${$page.url}/new`)}
	>
		<iconify-icon height="32" icon="ion:add" width="32" />
	</button>
{/if}

<svelte:head>
	<title>{data.listOwner.isMe ? "My" : `${data.listOwner.name}'s`} Wishes</title>
</svelte:head>
