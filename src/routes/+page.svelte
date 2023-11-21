<script lang="ts">
	import type { PageData } from "./$types";
	import UserCard from "$lib/components/UserCard.svelte";
	import { fade } from "svelte/transition";
	import ApprovalAlert from "$lib/components/wishlists/ApprovalAlert.svelte";
	import { hash, hashItems, viewedItems } from "$lib/stores/viewed-items";

	export let data: PageData;
	type PageUserData = (typeof data)["users"][0];

	const hasNewItems = async (user: PageUserData) => {
		if (user.items.length === 0) return false;
		const userHash = await hash(user.id);
		const currentHash = await hashItems(user.items);
		const viewedHash = $viewedItems[userHash];
		return currentHash !== viewedHash;
	};
</script>

<div class="flex flex-col space-y-4" in:fade>
	<ApprovalAlert approvalCount={data.me._count.items} />
	<UserCard hideCount user={data.me} />

	{#each data.users as user}
		{#await hasNewItems(user)}
			<UserCard {user} />
		{:then newItems}
			<UserCard {newItems} {user} />
		{/await}
	{/each}
</div>

<svelte:head>
	<title>Lists</title>
</svelte:head>
