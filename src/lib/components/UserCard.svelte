<script lang="ts">
	import Avatar from "./Avatar.svelte";

	export let hideCount = false;
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
		<div class="flex flex-row items-center space-x-4">
			<Avatar {user} width="w-14" />
			<span class="text-3xl font-bold">
				<span class="unstyled no-underline text-primary-700-200-token">{user.name}</span>
			</span>
		</div>
	</div>

	<div class="flex flex-row items-center space-x-2 p-4">
		<iconify-icon icon="ion:gift" />
		<span>
			{!hideCount && user._count ? `${user._count.items}/` : ""}{user.items.length}
		</span>
	</div>
</a>
