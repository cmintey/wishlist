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
		justify="justify-around"
		active="variant-glass-primary"
		hover="hover:variant-soft-primary"
		rounded="rounded-full"
		border=""
		class="bg-surface-200-700-token w-full py-4 md:hidden"
		padding="px-6 py-2"
	>
		{#each navItems as navItem, value}
			<Tab
				bind:group={tabsBottomNav}
				name={navItem.label}
				{value}
				on:click={() => goto(`${navItem.href}`)}
			>
				<iconify-icon icon={navItem.icon} class="text-xl" />
			</Tab>
		{/each}
	</TabGroup>
{/if}
