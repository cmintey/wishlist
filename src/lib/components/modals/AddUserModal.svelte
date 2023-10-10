<script lang="ts">
	import { UsersAPI } from "$lib/api/users";
	import type { User } from "@prisma/client";
	import { ListBox, ListBoxItem, getModalStore } from "@skeletonlabs/skeleton";

	export let parent: any;

    const modalStore = getModalStore();
	let selectedUser: string;

	function onFormSubmit(): void {
		if (selectedUser) {
			if ($modalStore[0].response) $modalStore[0].response(selectedUser);
			modalStore.close();
		}
	}

	const usersAPI = new UsersAPI();

	let users: User[] = [];
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
				<iconify-icon class="text-lg" icon="ion:search" />
			</div>
			<input class="input" type="search" on:input={doSearch} />
		</div>
	</label>

	{#if users.length > 0}
		<ListBox class="border border-surface-500 p-4 rounded-container-token">
			{#each users as user}
				<ListBoxItem name={user.name} value={user.id} bind:group={selectedUser}>
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
