<script lang="ts">
	import { goto, invalidateAll } from "$app/navigation";
	import {
		Table,
		tableMapperValues,
		tableSourceMapper,
		type TableSource,
		getModalStore,
		type ModalSettings,
		getToastStore
	} from "@skeletonlabs/skeleton";
	import Search from "../Search.svelte";
	import { GroupsAPI } from "$lib/api/groups";

	type Group = {
		id: string;
		name: string;
		userCount: number;
	};

	export let groups: Group[];

    const modalStore = getModalStore();
    const toastStore = getToastStore();

	let groupsFiltered: Group[];

	let groupData: TableSource;
	$: if (groupsFiltered) {
		groupData = {
			head: ["Name", "User Count"],
			body: tableMapperValues(groupsFiltered, ["name", "userCount"]),
			meta: tableSourceMapper(groupsFiltered, ["name", "id"])
		};
	}

	const selectionHandler = (meta: CustomEvent<string[]>) => {
		const group: Group = meta.detail as unknown as Group;
		goto(`/admin/groups/${group.id}`);
	};

	const createGroup = () => {
		const settings: ModalSettings = {
			type: "prompt",
			title: "Enter Group Name",
			body: "Provide the name of the group below.",
			valueAttr: { type: "text", minlength: 3, maxlength: 32, required: true },
			// Returns the updated response value
			response: async (name: string) => {
				const groupsAPI = new GroupsAPI();
				const group = await groupsAPI.create(name);
				if (group) {
					toastStore.trigger({
						message: "Group created successfully!"
					});
				} else {
					toastStore.trigger({
						message: "An unknown error occurred while creating the group"
					});
				}
				await invalidateAll();
			},
			// Optionally override the button text
			buttonTextCancel: "Cancel",
			buttonTextSubmit: "Submit"
		};

		modalStore.trigger(settings);
	};
</script>

<div class="mb-4 flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
	<Search data={groups} keys={["name"]} bind:result={groupsFiltered} />
	<button class="btn variant-filled-primary" on:click={createGroup}>
		<iconify-icon icon="ion:add" />
		<p>Create Group</p>
	</button>
</div>

{#if groupData}
	<Table interactive source={groupData} on:selected={selectionHandler} />
{/if}
