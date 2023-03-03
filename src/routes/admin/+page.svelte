<script lang="ts">
	import ActionForm from "$lib/components/admin/ActionsForm.svelte";
	import SettingsForm from "$lib/components/admin/SettingsForm/index.svelte";
	import SmtpAlert from "$lib/components/admin/SMTPAlert.svelte";
	import Users from "$lib/components/admin/Users.svelte";
	import { Tab, TabGroup } from "@skeletonlabs/skeleton";
	import type { PageData } from "./$types";

	export let data: PageData;

	let tabSet = 0;
</script>

<TabGroup>
	<Tab bind:group={tabSet} name="Users" value={0}>Users</Tab>
	<Tab bind:group={tabSet} name="Settings" value={1}>Settings</Tab>
	<Tab bind:group={tabSet} name="Actions" value={2}>Actions</Tab>

	<svelte:fragment slot="panel">
		{#if tabSet === 0}
			<Users users={data.users} currentUser={data.user} config={data.config} />
		{:else if tabSet === 1}
			<SmtpAlert smtpEnable={data.config.smtp.enable} />
			<SettingsForm config={data.config} />
		{:else if tabSet === 2}
			<ActionForm />
		{/if}
	</svelte:fragment>
</TabGroup>

<svelte:head>
	<title>Admin Settings</title>
</svelte:head>
