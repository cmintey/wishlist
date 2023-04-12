<script lang="ts">
	import { AppBar, drawerStore } from "@skeletonlabs/skeleton";
	import logo from "$lib/assets/logo.png";
	import { page } from "$app/stores";
	import NavMenu from "./NavMenu.svelte";
	import type { User } from "lucia-auth";

	export let navItems: NavItem[];
	export let user: User | null;
</script>

<AppBar background="bg-surface-200-700-token">
	<svelte:fragment slot="lead">
		<div class="flex space-x-4 items-center content-center">
			{#if user}
				<button
					class="btn btn-sm p-0 pt-0.5 md:hidden"
					on:click={() =>
						drawerStore.open({
							width: "w-[280px] md:w-[480px]"
						})}
				>
					<iconify-icon icon="ion:menu" class="text-2xl" />
				</button>
			{/if}

			<a class="flex flex-row space-x-2 items-center" href="/">
				<img src={logo} alt="Wishlist Logo" class="h-14" />
				<span class="text-4xl font-bold text-primary-900-50-token"> Wishlist </span>
			</a>
		</div>
	</svelte:fragment>

	{#if user}
		<div class="flex-row items-center pt-0.5 pl-4 hidden md:flex">
			{#each navItems as navItem}
				<a
					href={navItem.href}
					class="list-option px-4 py-2 font-bold"
					data-sveltekit-preload-data
					class:variant-filled-primary={$page.url.pathname === navItem.href}
				>
					{navItem.label}
				</a>
			{/each}
		</div>
	{/if}

	<svelte:fragment slot="trail">
		<NavMenu {user} />
	</svelte:fragment>
</AppBar>
