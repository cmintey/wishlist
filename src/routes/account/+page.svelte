<script lang="ts">
	import { enhance } from "$app/forms";
	import ChangePassword from "$lib/components/account/ChangePassword.svelte";
	import EditProfile from "$lib/components/account/EditProfile.svelte";
	import Avatar from "$lib/components/Avatar.svelte";
	import { FileButton, Tab, TabGroup } from "@skeletonlabs/skeleton";
	import type { PageServerData } from "./$types";

	export let data: PageServerData;

	let submitButton: HTMLElement;

	let tabSet = 0;
</script>

<TabGroup>
	<Tab bind:group={tabSet} name="Profile" value={0}>Profile</Tab>
	<Tab bind:group={tabSet} name="Security" value={1}>Security</Tab>
	<svelte:fragment slot="panel">
		{#if tabSet === 0}
			<div class="flex w-fit flex-col items-center">
				<div class="relative m-auto h-full w-full max-w-[150px]">
					<Avatar user={data.user} width="w-32" />
					<form
						method="POST"
						class="absolute bottom-0 right-0 h-12 w-12"
						action="?/profilePicture"
						use:enhance
					>
						<FileButton
							name="profilePic"
							id="profilePic"
							accept="image/*"
							button="btn-icon btn-icon-sm variant-glass-secondary"
							on:change={() => submitButton.click()}
						>
							<iconify-icon icon="ion:camera" class="text-2xl" />
						</FileButton>
						<button type="submit" bind:this={submitButton} />
					</form>
				</div>

				<EditProfile user={data.user} />
			</div>
		{:else if tabSet === 1}
			<ChangePassword />
		{/if}
	</svelte:fragment>
</TabGroup>

<svelte:head>
	<title>Account</title>
</svelte:head>
