<script lang="ts">
	import { viewOption } from "$lib/stores/view";
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
					<button class="list-option w-full" on:click={() => ($viewOption = "Ungifted")}
						>Ungifted</button
					>
				</li>
				<li>
					<button class="list-option w-full" on:click={() => ($viewOption = "Gifted")}
						>Gifted</button
					>
				</li>
			</ul>
		</nav>
	</span>
</div>
