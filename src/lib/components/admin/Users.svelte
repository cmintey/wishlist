<script lang="ts">
	import fuzzysort from "fuzzysort";

	type User = {
		username: string;
		name: string;
		role?: {
			name: string;
		};
	};
	export let users: User[];
	export let currentUser: User;

	let userSearch = "";
	$: usersFiltered = fuzzysort.go(userSearch, users, {
		keys: ["username", "name"],
		all: true
	});
</script>

<label class="w-fit">
	<span>Search</span>
	<div class="input-group grid-cols-[auto_1fr_auto]">
		<div class="input-group-shim ">
			<iconify-icon icon="ri:search-line" width="20px" class="-mb-1" />
		</div>
		<input class="input" type="search" bind:value={userSearch} />
	</div>
</label>
<span class="text-sm">*denotes admin</span>
<ul>
	{#each usersFiltered as user}
		<li>
			<a
				href={user.obj.username === currentUser.username
					? "/account"
					: `/admin/user/${user.obj.username}`}
			>
				{user.obj.name}
				<span class="italic text-sm">({user.obj.username})</span>
				{#if user.obj.role?.name === "ADMIN"}
					<span>*</span>
				{/if}
			</a>
		</li>
	{/each}
</ul>
