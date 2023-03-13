<script lang="ts">
	import { goto } from "$app/navigation";
	import { Table, tableMapperValues, tableSourceMapper } from "@skeletonlabs/skeleton";

	type Group = {
		id: string;
		name: string;
		userCount: number;
	};

	export let groups: Group[];

	const groupData = {
		head: ["Name", "User Count"],
		body: tableMapperValues(groups, ["name", "userCount"]),
		meta: tableSourceMapper(groups, ["name", "id"])
	};

	const selectionHandler = (meta: CustomEvent<Group>) => {
		const group = meta.detail;
		goto(`/admin/groups/${group.id}`);
	};
</script>

<Table source={groupData} interactive on:selected={selectionHandler} />
