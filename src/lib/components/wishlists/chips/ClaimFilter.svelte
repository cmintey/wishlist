<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { popup, type PopupSettings } from "@skeletonlabs/skeleton";

	const CLAIM_OPTIONS = {
		all: "All",
		claimed: "Claimed",
		unclaimed: "Unclaimed"
	};
	type ClaimOption = keyof typeof CLAIM_OPTIONS;

	let menuOpen = false;
	const menuSettings: PopupSettings = {
		event: "click",
		target: "view",
		state: ({ state }) => (menuOpen = state)
	};

	let filter = $page.url.searchParams.get("filter");
	let claimOption: ClaimOption = filter
		? Object.keys(CLAIM_OPTIONS).includes(filter)
			? (filter as ClaimOption)
			: "all"
		: "all";

	const handleClick = (opt: unknown) => {
		const option = opt as ClaimOption;
		claimOption = option;
		const newUrl = new URL($page.url);

		if (option === "all") newUrl.searchParams.delete("filter");
		else newUrl.searchParams.set("filter", option);

		goto(newUrl, {
			replaceState: true
		});
	};
</script>

<div class="flex flex-row space-x-4 pb-4">
	<span class="relative">
		<button
			class="chip variant-ringed-primary"
			class:variant-ghost-primary={claimOption !== "all"}
			use:popup={menuSettings}
		>
			<span>{CLAIM_OPTIONS[claimOption]}</span>
			<iconify-icon
				icon="ion:caret-down"
				class="text-xs arrow ease-out duration-300"
				class:rotate-180={menuOpen}
			/>
		</button>
		<nav class="list-nav card p-4 shadow-xl" data-popup="view">
			<ul>
				{#each Object.entries(CLAIM_OPTIONS) as [optionKey, optionValue]}
					<li>
						<button class="list-option w-full" on:click={() => handleClick(optionKey)}>
							{optionValue}
						</button>
					</li>
				{/each}
			</ul>
		</nav>
	</span>
</div>
