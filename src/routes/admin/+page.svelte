<script lang="ts">
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import TokenCopy from "$lib/components/TokenCopy.svelte";
	import {
		modalStore,
		ProgressRadial,
		toastStore,
		type ModalSettings,
		type ToastSettings
	} from "@skeletonlabs/skeleton";
	import fuzzysort from "fuzzysort";
	import type { ActionData, PageData } from "./$types";

	export let data: PageData;
	export let form: ActionData;

	let warningHidden = false;

	const triggerToast = () => {
		const toastConfig: ToastSettings = {
			message: "Invite sent!",
			preset: "success",
			autohide: true,
			timeout: 3000
		};
		toastStore.trigger(toastConfig);
	};

	let inviteUser = false;
	let sending = false;

	let userSearch = "";
	$: usersFiltered = fuzzysort.go(userSearch, data.users, {
		keys: ["username", "name"],
		all: true
	});

	const handleDelete = async () => {
		const settings: ModalSettings = {
			type: "confirm",
			title: "Please Confirm",
			body: `Are you sure you wish to clear all wishlists? <b>This action is irreversible!</b>`,
			// confirm = TRUE | cancel = FALSE
			response: async (r: boolean) => {
				if (r) {
					const resp = await fetch(`/api/items`, {
						method: "DELETE",
						headers: {
							"content-type": "application/json",
							accept: "application/json"
						}
					});

					if (resp.ok) {
						invalidateAll();

						toastStore.trigger({
							message: "All wishlists cleared.",
							autohide: true,
							timeout: 5000
						});
					} else {
						toastStore.trigger({
							message: `Oops! Something went wrong.`,
							classes: "bg-warning-500",
							autohide: true,
							timeout: 5000
						});
					}
				}
			}
		};
		modalStore.trigger(settings);
	};
</script>

<div class="mb-2">
	<h1 class="mb-2">Admin Settings</h1>
	<hr />
</div>

<div class="flex flex-col space-y-4 md:w-3/4">
	{#if !data.smtpEnabled && !warningHidden}
		<aside class="alert">
			<div>
				<span class="text-4xl">⚠️</span>
			</div>
			<div class="alert-message">
				<span class="text-2xl font-bold">SMTP is not enabled</span>
				<p>
					While email setup is not a requirement, users will not be able to reset their passwords
					via self-service and you will have to manually send out links to reset passwords.
				</p>
			</div>
			<div class="alert-actions">
				<a class="btn btn-filled-warning" href="/admin" target="_blank">View docs</a>
				<button class="btn-icon btn-ghost-primary" on:click={() => (warningHidden = true)}>
					<iconify-icon icon="ri:close-fill" />
				</button>
			</div>
		</aside>
	{/if}

	<h2>Actions</h2>
	<form
		method="POST"
		use:enhance={({ action }) => {
			if (action.search === "?/invite-user") {
				sending = true;
				return async ({ result, update }) => {
					if (result.type === "success") {
						triggerToast();
					}
					update();
					sending = false;
				};
			}
		}}
	>
		<div class="flex space-x-2">
			{#if data.smtpEnabled}
				<button
					class="btn btn-filled-primary w-fit"
					type="button"
					disabled={inviteUser}
					on:click={() => (inviteUser = true)}>Invite User</button
				>
			{:else}
				<button
					class="btn btn-filled-primary w-fit"
					formaction="?/invite-user"
					on:click={() => (inviteUser = true)}>Invite User</button
				>
			{/if}

			<button class="btn btn-ghost-error w-fit" type="button" on:click={handleDelete}
				>Clear Lists</button
			>
		</div>

		{#if data.smtpEnabled}
			{#if inviteUser}
				<div class="flex space-x-4 mt-2 items-end">
					<label for="invite-email">
						<span>Email</span>
						<input type="email" name="invite-email" id="invite-email" autocomplete="off" required />
					</label>
					<button
						class="btn btn-filled-primary w-fit h-min mb-1"
						formaction="?/invite-user"
						disabled={sending}
					>
						{#if sending}
							<span class="h-6 w-6">
								<ProgressRadial stroke={64} />
							</span>
						{:else}
							Invite
						{/if}
					</button>
				</div>
				{#if form?.error}
					<ul>
						{#each form.errors as error}
							<li class="text-xs text-red-500">{error.message}</li>
						{/each}
					</ul>
				{/if}
			{/if}
		{:else if form?.success && form?.url}
			<div>
				<TokenCopy url={form.url}>Invite link</TokenCopy>
				<span class="italic text-sm">This invite link is only valid for one signup</span>
			</div>
		{/if}
	</form>

	<h2>Users</h2>
	<label class="w-fit">
		<span>Search</span>
		<div class="relative">
			<input type="search" bind:value={userSearch} class="pl-8" />
			<div class="flex absolute left-4 inset-y-0 items-center pointer-events-none z-10">
				<iconify-icon icon="ri:search-line" />
			</div>
		</div>
	</label>
	<span class="text-sm">*denotes admin</span>
	<ul>
		{#each usersFiltered as user}
			<li>
				<a
					href={user.obj.username === data.user.username
						? "/account"
						: `/admin/user/${user.obj.username}`}
				>
					{user.obj.name}
					<span class="italic text-sm">({user.obj.username})</span>
					{#if user.obj.role.name === "ADMIN"}
						<span>*</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</div>
