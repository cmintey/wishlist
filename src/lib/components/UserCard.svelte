<script lang="ts">
	import { Avatar } from "@skeletonlabs/skeleton";

	export let user: {
		name: string;
		username: string;
		items: { id: number }[];
		_count?: {
			items: number;
		};
	};
</script>

<a class="card" href="/wishlists/{user.username}" data-sveltekit-preload-data>
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
		Items: {user._count ? `${user._count.items}/` : ""}{user.items.length}
	</div>
</a>
