<script lang="ts">
	import { goto } from "$app/navigation";
	import { Tab, TabGroup } from "@skeletonlabs/skeleton";
	import type { Snapshot } from "./$types";

	const tabs = [
		{ href: "/users", label: "Users" },
		{ href: "/groups", label: "Groups" },
		{ href: "/settings", label: "Settings" },
		{ href: "/actions", label: "Actions" }
	];

	let selectedTab = 0;

	export const snapshot: Snapshot = {
		capture: () => selectedTab,
		restore: (value) => (selectedTab = value)
	};
</script>

<TabGroup>
	{#each tabs as { label, href }, value}
		<Tab bind:group={selectedTab} name={label} {value} on:change={() => goto(`/admin${href}`)}>
			{label}
		</Tab>
	{/each}

	<svelte:fragment slot="panel">
		<slot />
	</svelte:fragment>
</TabGroup>

<svelte:head>
	<title>Admin Settings</title>
</svelte:head>
