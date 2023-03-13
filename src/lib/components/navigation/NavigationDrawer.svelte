<script lang="ts">
	import { Drawer, drawerStore } from "@skeletonlabs/skeleton";
	import { page } from "$app/stores";

	export let navItems: NavItem[];
</script>

<Drawer position="left">
	<div class="mt-4 flex flex-row place-content-between items-center px-4">
		<span class="text-4xl">Wishlist</span>
		<button class="btn-icon" on:click={() => drawerStore.close()}>
			<iconify-icon icon="ion:close" width="32" />
		</button>
	</div>
	<nav class="list-nav p-4">
		<ul>
			{#each navItems as navItem}
				<li>
					<a
						href={navItem.href}
						data-sveltekit-preload-data
						on:click={() => drawerStore.close()}
						class="list-option space-x-1 font-bold"
						class:variant-filled-primary={$page.url.pathname === navItem.href}
					>
						<iconify-icon icon={navItem.icon} class="text-xl" />
						<p>{navItem.label}</p>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</Drawer>
