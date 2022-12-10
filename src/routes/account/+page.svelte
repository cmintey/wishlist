<script lang="ts">
	import { enhance } from "$app/forms";
	import {
		AccordionGroup,
		AccordionItem,
		Avatar,
		Divider,
		toastStore
	} from "@skeletonlabs/skeleton";
	import type { ActionData, PageServerData } from "./$types";

	export let data: PageServerData;
	export let form: ActionData;

	let name = data.user.name;
	let editing = false;

	let currentPassword = "";
	let newPassword = "";
	let confirmPassword = "";
</script>

<div class="mb-2">
	<h1 class="mb-2">Account</h1>
	<Divider />
</div>

<div class="flex flex-col space-y-4 mb-4">
	<h2>Profile</h2>
	<div class="flex space-x-8 items-center">
		<div>
			<Avatar
				width="w-24 md:w-32"
				initials={data.user.name.split(" ").reduce((x, y) => x + y.at(0), "")}
			/>
		</div>

		<div class="flex flex-col">
			<div class="flex flex-row items-start md:space-x-1">
				{#if editing}
					<form
						method="POST"
						use:enhance={() => {
							editing = !editing;
						}}
					>
						<div class="flex flex-row items-center md:space-x-1">
							<label for="name">
								<span>Name</span>
								<input type="text" id="name" name="name" autocomplete="name" bind:value={name} />
							</label>

							<button
								type="submit"
								formaction="?/namechange"
								class="btn-icon pl-2 mt-6 text-lg md:text-2xl"
							>
								<iconify-icon icon="ri:save-fill" />
							</button>
						</div>
					</form>
				{:else}
					<span class="text-2xl md:text-4xl font-bold">{name}</span>
					<button
						type="button"
						class="btn-icon -mt-1 pl-2 md:mt-0 text-lg md:text-2xl"
						on:click={() => (editing = !editing)}
					>
						<iconify-icon icon="ri:pencil-fill" />
					</button>
				{/if}
			</div>

			<span>{data.user.username}</span>
		</div>
	</div>
</div>

<div class="flex flex-col space-y-4 mb-4">
	<h2>Security</h2>
	<form
		method="POST"
		use:enhance={() => {
			return async ({ update }) => {
				const t = {
					message: "Password updated successfully",
					autohide: true,
					timeout: 5000
				};
				toastStore.trigger(t);
				currentPassword = "";
				newPassword = "";
				confirmPassword = "";
				update();
			};
		}}
	>
		<div class="flex flex-col items-start space-y-4">
			<label>
				<span>Current Password</span>
				<input
					type="password"
					id="oldpassword"
					name="oldPassword"
					autocomplete="current-password"
					bind:value={currentPassword}
				/>
			</label>
			<label>
				<span>New Password</span>
				<input
					type="password"
					id="newpassword"
					autocomplete="new-password"
					bind:value={newPassword}
				/>
			</label>
			<label>
				<span>Confirm Password</span>
				<input
					type="password"
					id="confirmpassword"
					name="newPassword"
					autocomplete="new-password"
					bind:value={confirmPassword}
				/>
			</label>
			{#if newPassword !== confirmPassword}<span class="unstyled text-xs text-red-500"
					>Passwords must match</span
				>{/if}
			{#if form?.error}
				<ul>
					{#each form.errors as error}
						{#if error.field === "newPassword"}
							{#each error.message.split("\n") as message}
								<li class="text-xs text-red-500">{message}</li>
							{/each}
						{:else}
							<li class="text-xs text-red-500">{error.message}</li>
						{/if}
					{/each}
				</ul>
			{/if}
			<button
				type="submit"
				formaction="?/passwordchange"
				class="btn bg-primary-500 w-fit"
				disabled={currentPassword === "" || newPassword === "" || newPassword !== confirmPassword}
				>Update Password</button
			>
		</div>
	</form>
</div>

{#if data.user.role?.name === "ADMIN"}
	<div class="flex flex-col space-y-4">
		<h2>Admin</h2>

		<AccordionGroup collapse={false} padding="px-0" hover="">
			<AccordionItem>
				<svelte:fragment slot="summary"><h3>Users</h3></svelte:fragment>
				<svelte:fragment slot="content">
					<ul>
						{#each data.users as user}
							<li>
								<a href="/account/{user.username}"
									>{user.username}
									{#if user.role.name === "ADMIN"}
										<span class="text-xs italic">(admin)</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</svelte:fragment>
			</AccordionItem>
		</AccordionGroup>

		<h3>Actions</h3>
		<div class="flex space-x-2">
			<button class="btn bg-primary-500 w-fit" disabled>Invite User</button>
			<button class="btn bg-primary-500 w-fit" disabled>Clear Lists</button>
		</div>
	</div>
{/if}

<style lang="postcss">
	.btn {
		@apply text-white;
	}
</style>
