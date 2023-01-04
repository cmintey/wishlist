<script lang="ts">
	import type { Item } from "@prisma/client";
	import { Avatar } from "@skeletonlabs/skeleton";

	export let user: {
		name: string;
		username: string;
		myItems: Item[];
		_count?: {
			myItems: number;
		};
	};
</script>

<div class="card">
	<div class="card-header">
		<div class="flex flex-row space-x-4 items-center">
			<Avatar
				initials={user.name.split(" ").reduce((x, y) => x + y.at(0), "")}
				background="bg-primary-400-500-token"
			/>
			<h3>
				<a
					href="/wishlists/{user.username}"
					class="unstyled no-underline text-primary-900-50-token font-bold"
					data-sveltekit-preload-data>{user.name}</a
				>
			</h3>
		</div>
	</div>

	<div class="p-4">
		Items: {user._count ? `${user._count.myItems}/` : ""}{user.myItems.length}
	</div>
</div>
