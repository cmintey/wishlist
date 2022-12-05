<script lang="ts">
	import type { PageData } from "./$types";
	import UserCard from "$lib/components/UserCard.svelte";

	export let data: PageData;
</script>

<div class="flex flex-col space-y-4">
	<h2>Lists</h2>
	<UserCard user={data.me} />

	{#each data.users as user}
		<UserCard {user} />
	{/each}
</div>
