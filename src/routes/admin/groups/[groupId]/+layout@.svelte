<script lang="ts">
	import { goto } from "$app/navigation";
	import { Tab, TabGroup } from "@skeletonlabs/skeleton";
	import type { LayoutData, Snapshot } from "./$types";
	import { page } from "$app/stores";

	export let data: LayoutData;

	const tabs = [
		{ href: "/members", label: "Members" },
		{ href: "/settings", label: "Settings" }
	];

	let selectedTab = 0;

	export const snapshot: Snapshot = {
		capture: () => selectedTab,
		restore: (value) => (selectedTab = value)
	};
</script>

<h1 class="h1 pb-2">{data.group.name} Group</h1>

<TabGroup>
	{#each tabs as { label, href }, value}
		<Tab
			name={label}
			{value}
			bind:group={selectedTab}
			on:change={() => goto(`/admin/groups/${$page.params.groupId}${href}`, { replaceState: true })}
		>
			{label}
		</Tab>
	{/each}

	<svelte:fragment slot="panel">
		<slot />
	</svelte:fragment>
</TabGroup>

<svelte:head>
	<title>Group Settings</title>
</svelte:head>
