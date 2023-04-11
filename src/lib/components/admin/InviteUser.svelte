<script lang="ts">
	import { enhance } from "$app/forms";
	import { toastStore, type ToastSettings, modalStore } from "@skeletonlabs/skeleton";
	import TokenCopy from "$lib/components/TokenCopy.svelte";
	import { page } from "$app/stores";
	import type { Group } from "@prisma/client";

	export let config: Config;
	export let groups: Group[];

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

	let groupId: string;
	let email: string;

	let submitButton: HTMLButtonElement;

	const triggerInviteModal = () => {
		modalStore.trigger({
			type: "component",
			component: "inviteUser",
			meta: {
				groups,
				smtpEnabled: config.smtp.enable
			},
			response(data: { group?: string; email?: string }) {
				if (data.group) groupId = data.group;
				if (data.email) email = data.email;
				if (data.group) submitButton.click();
			}
		});
	};
</script>

<form
	method="POST"
	use:enhance={({ data }) => {
		data.set("invite-email", email);
		data.set("invite-group", groupId);

		return async ({ result, update }) => {
			if (result.type === "success" && config.smtp.enable) {
				triggerToast();
			}
			update();
		};
	}}
	class="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:items-end"
>
	<button class="btn variant-filled-primary w-fit" type="button" on:click={triggerInviteModal}>
		<iconify-icon icon="ion:person-add" />
		<p>Invite User</p>
	</button>

	<input class="hidden" name="invite-group" id="invite-group" />
	{#if config.smtp.enable}
		<input class="hidden" name="invite-email" id="invite-email" />
	{/if}

	{#if form?.url}
		<div class="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 md:items-center">
			<TokenCopy url={form.url}>Invite link</TokenCopy>
			<span class="italic text-sm">This invite link is only valid for one signup</span>
		</div>
	{/if}

	<button class="hidden" type="submit" bind:this={submitButton} />
</form>
