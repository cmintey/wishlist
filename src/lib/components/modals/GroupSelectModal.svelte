<script lang="ts">
	import { ListBox, ListBoxItem, modalStore } from "@skeletonlabs/skeleton";

	export let parent: any;
	let selectedGroup: string;
	let groups: Record<string, string>[] = $modalStore[0] ? $modalStore[0].meta?.groups : [];

	function onFormSubmit(): void {
		if (selectedGroup) {
			if ($modalStore[0]?.response) $modalStore[0].response(selectedGroup);
			modalStore.close();
		}
	}
</script>

<div class="card w-modal space-y-4 p-4 shadow-xl">
	<header class="text-2xl font-bold">Select Group</header>
	<ListBox class="border border-surface-500 p-4 rounded-container-token">
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
		<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Change Group</button>
	</footer>
</div>
