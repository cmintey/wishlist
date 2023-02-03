<script lang="ts">
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import {
		modalStore,
		ProgressRadial,
		toastStore,
		type ModalSettings,
		type ToastSettings
	} from "@skeletonlabs/skeleton";
	import TokenCopy from "$lib/components/TokenCopy.svelte";

	export let errors: { message: string }[] | null;
	export let url: string | null;
	// eslint-disable-next-line no-undef
	export let config: Config;

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
		{#if config.smtp.enable}
			<button
				class="btn variant-filled-primary w-fit"
				type="button"
				disabled={inviteUser}
				on:click={() => (inviteUser = true)}>Invite User</button
			>
		{:else}
			<button
				class="btn variant-filled-primary w-fit"
				formaction="?/invite-user"
				on:click={() => (inviteUser = true)}>Invite User</button
			>
		{/if}

		<button class="btn variant-ghost-error w-fit" type="button" on:click={handleDelete}
			>Clear Lists</button
		>
	</div>

	{#if config.smtp.enable}
		{#if inviteUser}
			<div class="flex space-x-4 mt-2 items-end">
				<label for="invite-email">
					<span>Email</span>
					<input type="email" name="invite-email" id="invite-email" autocomplete="off" required />
				</label>
				<button
					class="btn variant-filled-primary w-fit h-min"
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
				<button
					class="btn variant-ghost-secondary w-fit h-min"
					type="button"
					on:click={() => (inviteUser = false)}>Cancel</button
				>
			</div>
			{#if errors}
				<ul>
					{#each errors as error}
						<li class="text-xs text-red-500">{error.message}</li>
					{/each}
				</ul>
			{/if}
		{/if}
	{:else if url}
		<div>
			<TokenCopy {url}>Invite link</TokenCopy>
			<span class="italic text-sm">This invite link is only valid for one signup</span>
		</div>
	{/if}
</form>
