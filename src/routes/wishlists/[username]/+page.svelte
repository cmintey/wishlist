<script lang="ts">
	import type { PageData } from "./$types";
	import ItemCard from "$lib/components/ItemCard.svelte";
	import { goto, invalidate } from "$app/navigation";
	import { page } from "$app/stores";
	import { idle, listen } from "$lib/stores/idle";
	import { onDestroy, onMount } from "svelte";
	import { menu } from "@skeletonlabs/skeleton";

	export let data: PageData;
	let items = data.items;

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

	let menuView: boolean = false;
	const stateHandler = (response: { menu: string; state: boolean }): void => {
		if (response.menu === "view") menuView = response.state;
	};

	type ViewOption = "All" | "Pledged" | "Unpledged";
	let viewOption: ViewOption = "All";
	const setView = (option: ViewOption): void => {
		viewOption = option;
		if (option === "Pledged") {
			items = data.items.filter((item) => item.pledgedBy !== null);
		} else if (option === "Unpledged") {
			items = data.items.filter((item) => item.pledgedBy === null);
		} else {
			items = data.items;
		}
	};
</script>

<h1 class="pb-4">
	{data.listOwner.me ? "My" : `${data.listOwner.name}'s`} List
</h1>

{#if data.items.length === 0}
	<div>
		<p>No items yet</p>
	</div>
{:else}
	<!-- filter chips -->
	<div class="flex flex-row space-x-4 pb-4">
		<span class="relative">
			<button
				class="chip chip-primary"
				class:chip-primary-active={viewOption !== "All"}
				use:menu={{ menu: "view", state: stateHandler }}
			>
				<span>{viewOption}</span>
				<iconify-icon icon="ri:arrow-down-s-fill" class:rotate-180={menuView} />
			</button>
			<nav class="list-nav card p-4 shadow-xl" data-menu="view">
				<ul>
					<li>
						<button class="option w-full" on:click={() => setView("All")}>All</button>
					</li>
					<li>
						<button class="option w-full" on:click={() => setView("Unpledged")}>Unpledged</button>
					</li>
					<li>
						<button class="option w-full" on:click={() => setView("Pledged")}>Pledged</button>
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

<button
	class="btn btn-filled w-16 h-16 rounded-full fixed z-90 bottom-10 right-8"
	on:click={() => goto(`${$page.url}/new`)}
>
	<iconify-icon icon="ri:add-fill" width="32" height="32" />
</button>
