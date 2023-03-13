<script lang="ts">
	import { Table, tableMapperValues, tableSourceMapper } from "@skeletonlabs/skeleton";
	import type { PageData } from "./$types";

	export let data: PageData;

	const groupData = {
		head: ["Name", "Username", "Email", "Admin"],
		body: tableMapperValues(data.group.users, ["name", "username", "email", "isAdmin"]),
		meta: tableSourceMapper(data.group.users, ["id"])
	};

	const selectionHandler = (meta: CustomEvent<{ id: string }>) => {
		const user = meta.detail;
		console.log(user);
	};
</script>

<h1>{data.group.name}</h1>
<!-- TODO: Add Member -->
<!-- TODO: Add Remove Member -->

<Table source={groupData} interactive on:selected={selectionHandler} />
