<script lang="ts">
	import { UsersAPI } from "$lib/api/users";
	import type { AuthUser } from "@prisma/client";
	import { ListBox, ListBoxItem, modalStore } from "@skeletonlabs/skeleton";

	export let parent: any;
	let selectedUser: string;

	function onFormSubmit(): void {
		if (selectedUser) {
			if ($modalStore[0].response) $modalStore[0].response(selectedUser);
			modalStore.close();
		}
	}

	const usersAPI = new UsersAPI();

	let users: AuthUser[] = [];
	const doSearch = async (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		const resp = await usersAPI.search(e.currentTarget.value);
		users = await resp.json();
	};
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
	<header class="text-2xl font-bold">Add User</header>
	<span>Search for a user to add to the group</span>
	<label class="w-fit">
		<span>Search</span>
		<div class="input-group grid-cols-[auto_1fr_auto]">
			<div class="input-group-shim">
				<iconify-icon icon="ion:search" class="text-lg" />
			</div>
			<input class="input" type="search" on:input={doSearch} />
		</div>
	</label>

	{#if users.length > 0}
		<ListBox class="border border-surface-500 p-4 rounded-container-token">
			{#each users as user}
				<ListBoxItem bind:group={selectedUser} name={user.name} value={user.id}>
					{user.name}
				</ListBoxItem>
			{/each}
		</ListBox>
	{/if}

	<footer class="modal-footer {parent.regionFooter}">
		<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>
			{parent.buttonTextCancel}
		</button>
		<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Add User</button>
	</footer>
</div>
