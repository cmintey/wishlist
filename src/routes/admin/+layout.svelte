<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import ActionForm from "$lib/components/admin/ActionsForm.svelte";
	import Groups from "$lib/components/admin/Groups.svelte";
	import SettingsForm from "$lib/components/admin/SettingsForm/index.svelte";
	import SmtpAlert from "$lib/components/admin/SMTPAlert.svelte";
	import Users from "$lib/components/admin/Users.svelte";
	import { Tab, TabGroup } from "@skeletonlabs/skeleton";
	import type { PageData, Snapshot } from "./$types";
	import { writable } from "svelte/store";

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

	<!-- <svelte:fragment slot="panel">
		{#if tabSet === 0}
			<Users users={data.users} currentUser={data.user} config={data.config} />
		{:else if tabSet === 1}
			<Groups groups={data.groups} />
		{:else if tabSet === 2}
			<SmtpAlert smtpEnable={data.config.smtp.enable} />
			<SettingsForm config={data.config} />
		{:else if tabSet === 3}
			<ActionForm />
		{/if}
	</svelte:fragment> -->
</TabGroup>

<svelte:head>
	<title>Admin Settings</title>
</svelte:head>
