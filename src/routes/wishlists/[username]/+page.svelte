<script lang="ts">
	import type { PageData } from "./$types";
	import ItemCard from "$lib/components/ItemCard.svelte";
	import { goto, invalidate } from "$app/navigation";
	import { page } from "$app/stores";
	import { idle, listen } from "$lib/stores/idle";
	import { onDestroy, onMount } from "svelte";
	import { menu } from "@skeletonlabs/skeleton";
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

	let menuView = false;
	const stateHandler = (response: { menu: string; state: boolean }): void => {
		if (response.menu === "view") menuView = response.state;
	};
</script>

<h1 class="pb-4">
	{data.listOwner.me ? "My" : `${data.listOwner.name}'s`} List
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
	<!-- filter chips -->
	<div class="flex flex-row space-x-4 pb-4">
		<span class="relative">
			<button
				class="chip variant-ringed-primary"
				class:variant-ghost-primary={$viewOption !== "All"}
				use:menu={{ menu: "view", state: stateHandler }}
			>
				<span>{$viewOption}</span>
				<iconify-icon icon="ri:arrow-down-s-fill" class:rotate-180={menuView} />
			</button>
			<nav class="list-nav card p-4 shadow-xl" data-menu="view">
				<ul>
					<li>
						<button class="list-option w-full" on:click={() => ($viewOption = "All")}>All</button>
					</li>
					<li>
						<button class="list-option w-full" on:click={() => ($viewOption = "Unpledged")}
							>Unpledged</button
						>
					</li>
					<li>
						<button class="list-option w-full" on:click={() => ($viewOption = "Pledged")}
							>Pledged</button
						>
					</li>
				</ul>
			</nav>
		</span>
	</div>
	<div class="flex flex-col space-y-4">
		{#each items as item}
			<ItemCard {item} user={data.user} />
		{/each}
	</div>
{/if}

{#if data.listOwner.me || data.suggestionsEnabled}
	<button
		class="btn variant-filled w-16 h-16 rounded-full fixed z-90 bottom-10 right-8"
		on:click={() => goto(`${$page.url}/new`)}
	>
		<iconify-icon icon="ri:add-fill" width="32" height="32" />
	</button>
{/if}
