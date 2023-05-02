<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { TabGroup, Tab } from "@skeletonlabs/skeleton";
	import { getContext } from "svelte";
	import type { Writable } from "svelte/store";

	export let navItems: NavItem[];

	let isInstalled = getContext<Writable<boolean>>("nav");
	let tabsBottomNav: number;

	tabsBottomNav = navItems.findIndex((n) => $page.url.pathname.startsWith(n.href));
</script>

{#if $isInstalled}
	<TabGroup
		class="w-full py-4 bg-surface-200-700-token md:hidden"
		active="variant-glass-primary"
		border=""
		hover="hover:variant-soft-primary"
		justify="justify-around"
		padding="px-6 py-2"
		rounded="rounded-full"
	>
		{#each navItems as navItem, value}
			<Tab
				name={navItem.label}
				{value}
				bind:group={tabsBottomNav}
				on:click={() => goto(`${navItem.href}`)}
			>
				<iconify-icon class="text-xl" icon={navItem.icon} />
			</Tab>
		{/each}
	</TabGroup>
{/if}
