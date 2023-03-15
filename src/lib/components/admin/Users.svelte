<script lang="ts">
	import { goto } from "$app/navigation";
	import {
		Table,
		tableMapperValues,
		tableSourceMapper,
		type TableSource
	} from "@skeletonlabs/skeleton";
	import fuzzysort from "fuzzysort";
	import Search from "../Search.svelte";
	import InviteUser from "./InviteUser.svelte";

	type User = {
		username: string;
		name: string;
		email?: string;
		isAdmin: boolean;
	};

	export let users: (User & { groups?: string[] })[];
	export let currentUser: User;
	export let config: Config;

	let usersFiltered: (User & { groups?: string[] })[];

	let userData: TableSource;
	$: if (usersFiltered) {
		userData = {
			head: ["Name", "Username", "Email", "Admin", "Groups"],
			body: tableMapperValues(usersFiltered, ["name", "username", "email", "isAdmin", "groups"]),
			meta: tableSourceMapper(usersFiltered, ["name", "username", "email", "isAdmin"])
		};
	}

	const selectionHandler = (meta: CustomEvent<User>) => {
		const user = meta.detail;
		goto(user.username === currentUser.username ? "/account" : `/admin/user/${user.username}`);
	};
</script>

<div class="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:items-end mb-4">
	<Search data={users} keys={["name", "username"]} bind:result={usersFiltered} />
	<InviteUser {config} />
</div>

{#if userData}
	<Table source={userData} interactive on:selected={selectionHandler} />
{/if}
