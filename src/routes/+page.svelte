<script lang="ts">
	import type { PageData } from "./$types";
	import { Avatar } from "@brainandbones/skeleton";

	export let data: PageData;
</script>

<div class="flex flex-col space-y-4">
	<h2>Lists</h2>
	{#each data.users as user}
		<div class="card">
			<div class="card-header">
				<div class="flex flex-row space-x-4 items-center">
					<Avatar initials={`${user.firstname.at(0)}${user.lastname.at(0)}`} />
					<h3>
						<a
							href="/wishlists/{user.username}"
							class="unstyled no-underline"
							data-sveltekit-prefetch>{user.firstname} {user.lastname}</a
						>
					</h3>
				</div>
			</div>
			<div class="card-body">Items: {user._count.myItems}/{user.myItems.length}</div>
		</div>
	{/each}
</div>
