<script lang="ts">
	import type { PageData } from "./$types";
	import UserCard from "$lib/components/UserCard.svelte";
	import { fade } from "svelte/transition";
	import ApprovalAlert from "$lib/components/wishlists/ApprovalAlert.svelte";

	export let data: PageData;
</script>

<div in:fade class="flex flex-col space-y-4">
	<h1>Lists</h1>
	<ApprovalAlert approvalCount={data.me._count.items} />
	<UserCard user={data.me} hideCount />

	{#each data.users as user}
		<UserCard {user} />
	{/each}
</div>

<svelte:head>
	<title>Wishlist</title>
</svelte:head>
