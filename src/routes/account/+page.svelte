<script lang="ts">
	import ChangePassword from "$lib/components/account/ChangePassword.svelte";
	import EditProfile from "$lib/components/account/EditProfile.svelte";
	import { Avatar, Tab, TabGroup } from "@skeletonlabs/skeleton";
	import type { PageServerData } from "./$types";

	export let data: PageServerData;

	$: initials = data.user.name.split(" ").reduce((x, y) => x + y.at(0), "");
	let tabSet = 0;
</script>

<TabGroup>
	<Tab bind:group={tabSet} name="Profile" value={0}>Profile</Tab>
	<Tab bind:group={tabSet} name="Security" value={1}>Security</Tab>
	<svelte:fragment slot="panel">
		{#if tabSet === 0}
			<div class="flex flex-col w-fit items-center">
				<Avatar width="w-24 md:w-32" {initials} background="bg-primary-400-500-token" />

				<EditProfile user={data.user} />
			</div>
		{:else if tabSet === 1}
			<ChangePassword />
		{/if}
	</svelte:fragment>
</TabGroup>
