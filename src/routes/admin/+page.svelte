<script lang="ts">
	import ActionForm from "$lib/components/admin/ActionsForm.svelte";
	import SettingsForm from "$lib/components/admin/SettingsForm.svelte";
	import Users from "$lib/components/admin/Users.svelte";
	import type { ActionData, PageData } from "./$types";

	export let data: PageData;
	export let form: ActionData;

	type Error = {
		field: string | number;
		message: string;
	};
	let errors = form?.action === "invite-user" && form?.error ? (form?.errors as Error[]) : null;
	let url = form?.action === "invite-user" && form?.success ? (form?.url as string | null) : null;

	let warningHidden = false;
</script>

<div class="mb-2">
	<h1 class="mb-2">Admin Settings</h1>
	<hr />
</div>

{#if !data.config.smtp.enable && !warningHidden}
	<aside class="alert variant-ghost-warning mb-2">
		<div>
			<span class="text-4xl">⚠️</span>
		</div>
		<div class="alert-message">
			<span class="text-2xl font-bold">SMTP is not enabled</span>
			<p>
				While email setup is not a requirement, users will not be able to reset their passwords via
				self-service and you will have to manually send out links to reset passwords.
			</p>
		</div>
		<div class="alert-actions">
			<a class="btn variant-filled-warning" href="/admin" target="_blank">View docs</a>
			<button class="btn-icon variant-ghost-error" on:click={() => (warningHidden = true)}>
				<iconify-icon icon="ri:close-fill" />
			</button>
		</div>
	</aside>
{/if}

<div class="flex flex-col space-y-4">
	<h2>Actions</h2>
	<ActionForm {errors} {url} config={data.config} />

	<h2>Settings</h2>
	<SettingsForm config={data.config} />

	<h2>Users</h2>
	<Users users={data.users} currentUser={data.user} />
</div>
