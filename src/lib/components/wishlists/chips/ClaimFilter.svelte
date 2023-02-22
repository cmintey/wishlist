<script lang="ts">
	import { claimOption, CLAIM_OPTIONS } from "$lib/stores/filters";
	import { popup, type PopupSettings } from "@skeletonlabs/skeleton";
	import { flip } from "svelte/animate";

	let menuOpen = false;
	const menuSettings: PopupSettings = {
		event: "click",
		target: "view",
		state: ({ state }) => (menuOpen = state)
	};
</script>

<div class="flex flex-row space-x-4 pb-4">
	<span class="relative">
		<button
			class="chip variant-ringed-primary"
			class:variant-ghost-primary={$claimOption !== "All"}
			use:popup={menuSettings}
		>
			<span>{$claimOption}</span>
			<iconify-icon
				icon="ion:caret-down"
				class="text-xs arrow ease-out duration-300"
				class:rotate-180={menuOpen}
			/>
		</button>
		<nav class="list-nav card p-4 shadow-xl" data-popup="view">
			<ul>
				{#each CLAIM_OPTIONS as OPTION}
					<li>
						<button class="list-option w-full" on:click={() => ($claimOption = OPTION)}>
							{OPTION}
						</button>
					</li>
				{/each}
			</ul>
		</nav>
	</span>
</div>
