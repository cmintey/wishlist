<script lang="ts">
	import { claimOption, CLAIM_OPTIONS } from "$lib/stores/filters";
	import { menu } from "@skeletonlabs/skeleton";

	let menuView = false;
	const stateHandler = (response: { menu: string; state: boolean }): void => {
		if (response.menu === "view") menuView = response.state;
	};
</script>

<div class="flex flex-row space-x-4 pb-4">
	<span class="relative">
		<button
			class="chip variant-ringed-primary"
			class:variant-ghost-primary={$claimOption !== "All"}
			use:menu={{ menu: "view", state: stateHandler }}
		>
			<span>{$claimOption}</span>
			<iconify-icon icon="ion:caret-down" class="text-xs" class:rotate-180={menuView} />
		</button>
		<nav class="list-nav card p-4 shadow-xl" data-menu="view">
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
