<script lang="ts">
	import { goto } from "$app/navigation";
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

<a href="/wishlists/{user.username}" class="unstyled" data-sveltekit-preload-data>
	<div class="card">
		<div class="card-header">
			<div class="flex flex-row space-x-4 items-center">
				<Avatar
					initials={user.name.split(" ").reduce((x, y) => x + y.at(0), "")}
					background="bg-primary-400-500-token"
				/>
				<span class="font-bold text-3xl">
					<span class="unstyled no-underline text-primary-700-200-token">{user.name}</span>
				</span>
			</div>
		</div>

		<div class="p-4">
			Items: {user._count ? `${user._count.myItems}/` : ""}{user.myItems.length}
		</div>
	</div>
</a>
