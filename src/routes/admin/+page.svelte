<script lang="ts">
	import ActionForm from "$lib/components/admin/ActionsForm.svelte";
	import SettingsForm from "$lib/components/admin/SettingsForm/index.svelte";
	import SmtpAlert from "$lib/components/admin/SMTPAlert.svelte";
	import Users from "$lib/components/admin/Users.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<div class="mb-2">
	<h1 class="mb-2">Admin Settings</h1>
	<hr />
</div>

<SmtpAlert smtpEnable={data.config.smtp.enable} />

<div class="flex flex-col space-y-4">
	<h2>Actions</h2>
	<ActionForm smtpEnable={data.config.smtp.enable} />

	<h2>Settings</h2>
	<SettingsForm config={data.config} />

	<h2>Users</h2>
	<Users users={data.users} currentUser={data.user} />
</div>

<svelte:head>
	<title>Admin Settings</title>
</svelte:head>
