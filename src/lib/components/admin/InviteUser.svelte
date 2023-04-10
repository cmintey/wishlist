<script lang="ts">
	import { enhance } from "$app/forms";
	import { ProgressRadial, toastStore, type ToastSettings } from "@skeletonlabs/skeleton";
	import TokenCopy from "$lib/components/TokenCopy.svelte";
	import { page } from "$app/stores";

	export let config: Config;

	$: form = $page.form;

	const triggerToast = () => {
		const toastConfig: ToastSettings = {
			message: "Invite sent!",
			background: "variant-filled-success",
			autohide: true,
			timeout: 3000
		};
		toastStore.trigger(toastConfig);
	};

	let inviteUser = false;
	let sending = false;
</script>

<form
	method="POST"
	use:enhance={() => {
		sending = true;
		return async ({ result, update }) => {
			if (result.type === "success" && config.smtp.enable) {
				triggerToast();
			}
			update();
			sending = false;
		};
	}}
	class="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:items-end"
>
	{#if config.smtp.enable}
		<button
			class="btn variant-filled-primary w-fit"
			type="button"
			disabled={inviteUser}
			on:click={() => (inviteUser = true)}
		>
			<iconify-icon icon="ion:person-add" />
			<p>Invite User</p>
		</button>
	{:else}
		<button class="btn variant-filled-primary w-fit" on:click={() => (inviteUser = true)}>
			<iconify-icon icon="ion:person-add" />
			<p>Invite User</p>
		</button>
	{/if}

	{#if config.smtp.enable}
		{#if inviteUser}
			<div class="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:items-end">
				<label for="invite-email" class="w-fit">
					<span>Email</span>
					<input
						class="input"
						type="email"
						name="invite-email"
						id="invite-email"
						autocomplete="off"
						required
					/>
				</label>
				<div class="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
					<button class="btn variant-filled-primary w-fit h-min" disabled={sending}>
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
						on:click={() => (inviteUser = false)}
					>
						Cancel
					</button>
				</div>
			</div>
			{#if form?.error && form?.errors}
				<ul>
					{#each form.errors as error}
						<li class="text-xs text-red-500">{error.message}</li>
					{/each}
				</ul>
			{/if}
		{/if}
	{:else if form?.url}
		<div class="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 md:items-center">
			<TokenCopy url={form.url}>Invite link</TokenCopy>
			<span class="italic text-sm">This invite link is only valid for one signup</span>
		</div>
	{/if}
</form>
