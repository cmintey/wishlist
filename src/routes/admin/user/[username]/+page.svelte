<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto, invalidateAll } from "$app/navigation";
	import TokenCopy from "$lib/components/TokenCopy.svelte";
	import { Divider, modalStore, toastStore, type ModalSettings } from "@skeletonlabs/skeleton";
	import type { ActionData, PageData } from "./$types";

	export let data: PageData;
	export let form: ActionData;

	const handleDelete = async (username: string, userId: string) => {
		const settings: ModalSettings = {
			type: "confirm",
			title: "Please Confirm",
			body: `Are you sure you wish to delete ${username}? <b>This action is irreversible!</b>`,
			// confirm = TRUE | cancel = FALSE
			response: async (r: boolean) => {
				if (r) {
					const resp = await fetch(`/api/users/${userId}`, {
						method: "DELETE",
						headers: {
							"content-type": "application/json",
							accept: "application/json"
						}
					});

					if (resp.ok) {
						await goto("/admin");
						invalidateAll();

						toastStore.trigger({
							message: `${userId} was deleted`,
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

<div class="flex flex-col space-y-2">
	<h1 class="mb-2">{data.editingUser.name}'s Settings</h1>
	<Divider />
	<h2>Username: {data.editingUser.username}</h2>
	<h3>Id: {data.editingUser.id}</h3>
</div>

<form method="POST" use:enhance>
	<div class="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 mt-4">
		<button class="btn btn-filled-primary w-fit" formaction="?/reset-password">
			Generate Reset Password Link
		</button>
		{#if data.editingUser.role.name == "ADMIN"}
			<button class="btn btn-ghost-secondary w-fit" formaction="?/remove-admin">
				Remove Admin
			</button>
		{:else}
			<button class="btn btn-ghost-secondary w-fit" formaction="?/make-admin"> Make Admin </button>
		{/if}
		<button
			class="btn btn-filled-warning w-fit"
			type="button"
			on:click={() => handleDelete(data.editingUser.username, data.editingUser.id)}
			>Delete User</button
		>
	</div>
</form>

{#if form?.success && form?.url}
	<TokenCopy url={form.url}>Password reset link</TokenCopy>
{/if}
