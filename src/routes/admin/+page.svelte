<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import ActionForm from "$lib/components/admin/ActionsForm.svelte";
	import Groups from "$lib/components/admin/Groups.svelte";
	import SettingsForm from "$lib/components/admin/SettingsForm/index.svelte";
	import SmtpAlert from "$lib/components/admin/SMTPAlert.svelte";
	import Users from "$lib/components/admin/Users.svelte";
	import { Tab, TabGroup } from "@skeletonlabs/skeleton";
	import type { PageData } from "./$types";

	export let data: PageData;
	const tabs = ["Users", "Groups", "Settings", "Actions"];

	let tabSet = $page.url.searchParams.has("tab")
		? Number.parseInt($page.url.searchParams.get("tab") || "")
		: 0;

	const handleTabSelect = (tab: number) => goto(`?tab=${tab}`, { replaceState: true });
</script>

<TabGroup>
	{#each tabs as name, value}
		<Tab bind:group={tabSet} {name} {value} on:change={() => handleTabSelect(value)}>{name}</Tab>
	{/each}

	<svelte:fragment slot="panel">
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
	</svelte:fragment>
</TabGroup>

<svelte:head>
	<title>Admin Settings</title>
</svelte:head>
