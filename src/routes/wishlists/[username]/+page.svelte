<script lang="ts">
	import type { PageData } from "./$types";
	import ItemCard from "$lib/components/wishlists/ItemCard.svelte";
	import FilterChip from "$lib/components/wishlists/FilterChip.svelte";
	import { goto, invalidate } from "$app/navigation";
	import { page } from "$app/stores";
	import { idle, listen } from "$lib/stores/idle";
	import { onDestroy, onMount } from "svelte";
	import { viewOption } from "$lib/stores/view";

	export let data: PageData;
	let items = data.items;
	$: {
		if ($viewOption === "Pledged") {
			items = data.items.filter((item) => item.pledgedBy !== null);
		} else if ($viewOption === "Unpledged") {
			items = data.items.filter((item) => item.pledgedBy === null);
		} else {
			items = data.items;
		}
	}

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

	onMount(pollUpdate);
	onDestroy(() => clearTimeout(pollTimeout));

	$: if (!$idle && !polling) {
		polling = true;
		pollUpdate();
	}
</script>

<h1 class="pb-4">
	{data.listOwner.isMe ? "My" : `${data.listOwner.name}'s`} List
</h1>

{#if data.approvals.length > 0}
	<h2 class="pb-2">Approvals</h2>
	<div class="flex flex-col space-y-4 pb-2">
		{#each data.approvals as item}
			<ItemCard {item} user={data.user} />
		{/each}
	</div>
	<hr class="pb-2" />
{/if}

{#if data.items.length === 0}
	<div>
		<p>No items yet</p>
	</div>
{:else}
	{#if !data.listOwner.isMe}
		<FilterChip />
	{/if}

	<div class="flex flex-col space-y-4">
		{#each items as item}
			<ItemCard {item} user={data.user} />
		{/each}
	</div>
	<footer>
		<div class="h-16" />
	</footer>
{/if}

<!-- Add Item button -->
{#if data.listOwner.isMe || data.suggestionsEnabled}
	<button
		class="btn variant-ghost-surface w-16 h-16 rounded-full fixed z-90 bottom-4 right-4 md:bottom-10 md:right-10"
		on:click={() => goto(`${$page.url}/new`)}
	>
		<iconify-icon icon="ri:add-fill" width="32" height="32" />
	</button>
{/if}
