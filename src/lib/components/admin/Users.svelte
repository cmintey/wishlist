<script lang="ts">
	import { goto } from "$app/navigation";
	import {
		Table,
		tableMapperValues,
		tableSourceMapper,
		type TableSource
	} from "@skeletonlabs/skeleton";
	import fuzzysort from "fuzzysort";
	import InviteUser from "./InviteUser.svelte";

	type User = {
		username: string;
		name: string;
		email?: string;
		isAdmin: boolean;
	};

	export let users: User[];
	export let currentUser: User;
	export let config: Config;

	let userSearch = "";
	$: usersFiltered = fuzzysort
		.go(userSearch, users, {
			keys: ["username", "name"],
			all: true
		})
		.map((result) => result.obj);

	let userData: TableSource;
	$: if (usersFiltered) {
		userData = {
			head: ["Name", "Username", "Email", "Admin"],
			body: tableMapperValues(usersFiltered, ["name", "username", "email", "isAdmin"]),
			meta: tableSourceMapper(usersFiltered, ["name", "username", "email", "isAdmin"])
		};
	}

	const selectionHandler = (meta: CustomEvent<User>) => {
		const user = meta.detail;
		goto(user.username === currentUser.username ? "/account" : `/admin/user/${user.username}`);
	};
</script>

<div class="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 md:items-end mb-4">
	<label class="w-fit">
		<span>Search</span>
		<div class="input-group grid-cols-[auto_1fr_auto]">
			<div class="input-group-shim ">
				<iconify-icon icon="ion:search" class="text-lg" />
			</div>
			<input class="input" type="search" bind:value={userSearch} />
		</div>
	</label>

	<InviteUser {config} />
</div>

{#if userData}
	<Table source={userData} interactive on:selected={selectionHandler} />
{/if}
