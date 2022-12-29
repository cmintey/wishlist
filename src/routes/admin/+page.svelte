<script lang="ts">
	import { Alert } from "@skeletonlabs/skeleton";
	import fuzzysort from "fuzzysort";
	import type { PageData } from "./$types";

	export let data: PageData;
	let users = data.users.slice();

	let userSearch = "";
	$: console.log(userSearch);
	$: usersFiltered = fuzzysort.go(userSearch, users, { keys: ["username", "name"], all: true });
</script>

<div class="flex flex-col space-y-4 w-3/4">
	<h2>Admin Settings</h2>

	<Alert visible={!data.smtpEnabled || false}>
		<svelte:fragment slot="lead"><span class="text-4xl">⚠️</span></svelte:fragment>
		<svelte:fragment slot="title">SMTP is not enabled</svelte:fragment>
		<span
			>While email setup is not a requirement, users will not be able to reset their passwords via
			self-service and you will have to manually send out links to reset passwords.</span
		>
		<svelte:fragment slot="trail">
			<a class="btn btn-filled-warning" href="/admin" target="_blank">View docs</a>
		</svelte:fragment>
	</Alert>

	<h3>Actions</h3>
	<div class="flex space-x-2">
		<button class="btn btn-filled-primary w-fit" disabled>Invite User</button>
		<button class="btn btn-filled-primary w-fit" disabled>Clear Lists</button>
	</div>

	<h3>Users</h3>
	<label class="w-fit">
		<span>Search</span>
		<div class="relative">
			<input type="search" bind:value={userSearch} class="pl-8" />
			<div class="flex absolute left-4 inset-y-0 items-center pointer-events-none z-10">
				<iconify-icon icon="ri:search-line" />
			</div>
		</div>
	</label>
	<ul>
		{#each usersFiltered as user}
			<li>
				<a
					href={user.obj.username === data.user.username
						? "/account"
						: `/admin/user/${user.obj.username}`}
					>{user.obj.username}
					{#if user.obj.role.name === "ADMIN"}
						<span class="text-xs italic">(admin)</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</div>
