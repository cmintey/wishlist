<script lang="ts">
	import { goto } from "$app/navigation";
	import {
		Table,
		tableMapperValues,
		tableSourceMapper,
		type TableSource
	} from "@skeletonlabs/skeleton";
	import Search from "../Search.svelte";

	type Group = {
		id: string;
		name: string;
		userCount: number;
	};

	export let groups: Group[];

	let groupsFiltered: Group[];

	let groupData: TableSource;
	$: if (groupsFiltered) {
		groupData = {
			head: ["Name", "User Count"],
			body: tableMapperValues(groupsFiltered, ["name", "userCount"]),
			meta: tableSourceMapper(groupsFiltered, ["name", "id"])
		};
	}

	const selectionHandler = (meta: CustomEvent<Group>) => {
		const group = meta.detail;
		goto(`/admin/groups/${group.id}`);
	};
</script>

<div class="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:items-end mb-4">
	<Search data={groups} keys={["name"]} bind:result={groupsFiltered} />
</div>

{#if groupData}
	<Table source={groupData} interactive on:selected={selectionHandler} />
{/if}
