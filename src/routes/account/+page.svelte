<script lang="ts">
	import ChangePassword from "$lib/components/account/ChangePassword.svelte";
	import EditProfile from "$lib/components/account/EditProfile.svelte";
	import { Avatar } from "@skeletonlabs/skeleton";
	import type { PageServerData } from "./$types";

	export let data: PageServerData;

	$: initials = data.user.name.split(" ").reduce((x, y) => x + y.at(0), "");
</script>

<div class="mb-2">
	<h1 class="mb-2">Account</h1>
	<hr />
</div>

<div class="flex flex-col space-y-4 mb-4">
	<h2>Profile</h2>
	<div class="flex space-x-8 items-center">
		<div>
			<Avatar width="w-24 md:w-32" {initials} background="bg-primary-400-500-token" />
		</div>

		<EditProfile user={data.user} />
	</div>
</div>

<div class="flex flex-col space-y-4 mb-4">
	<h2>Security</h2>
	<ChangePassword />
</div>
