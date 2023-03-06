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
			<div class="flex flex-col w-fit items-center">
				<div class="picture">
					<Avatar user={data.user} width="w-24 md:w-32" />
					<form method="POST" class="add-icon" action="?/profilePicture" use:enhance>
						<FileButton
							name="profilePic"
							id="profilePic"
							accept="image/*"
							button="btn-icon variant-glass-secondary"
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

<style>
	.picture {
		width: 100% !important;
		height: 100% !important;
		max-width: 150px !important;
		max-height: 150px !important;
		margin: auto;
		position: relative;
	}

	.add-icon {
		width: 50px;
		height: 50px;
		border-radius: 100%;
		position: absolute;
		bottom: 0;
		right: 0;
	}
</style>
