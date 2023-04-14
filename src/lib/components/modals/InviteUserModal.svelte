<script lang="ts">
	import { ListBox, ListBoxItem, modalStore } from "@skeletonlabs/skeleton";

	export let parent: any;
	let userEmail: string;
	let selectedGroup: string;

	// passed in via meta
	let groups: Record<string, string>[] = $modalStore[0] ? $modalStore[0].meta?.groups : [];
	let smtpEnabled: boolean = $modalStore[0] ? $modalStore[0].meta?.smtpEnabled : false;

	function onFormSubmit(): void {
		if (selectedGroup) {
			if ($modalStore[0].response)
				$modalStore[0].response({
					group: selectedGroup,
					email: userEmail
				});
			modalStore.close();
		}
	}
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
	<header class="text-2xl font-bold">Invite User</header>

	{#if smtpEnabled}
		<span>Enter the user's email and select a group for the user to join</span>
	{:else}
		<span>Select a group for the user to join. An invite link will be generated</span>
	{/if}

	{#if smtpEnabled}
		<label for="invite-email" class="w-fit">
			<span>Email</span>
			<input
				class="input"
				type="email"
				name="invite-email"
				id="invite-email"
				autocomplete="off"
				required
				bind:value={userEmail}
			/>
		</label>
	{/if}

	<label for="group">Group</label>
	<ListBox id="group" class="border border-surface-500 p-4 rounded-container-token">
		{#each groups as group}
			<ListBoxItem bind:group={selectedGroup} name={group.name} value={group.id}>
				{group.name}
			</ListBoxItem>
		{/each}
	</ListBox>

	<footer class="modal-footer {parent.regionFooter}">
		<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>
			{parent.buttonTextCancel}
		</button>
		<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Invite</button>
	</footer>
</div>
