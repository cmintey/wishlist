<script lang="ts">
	import "@skeletonlabs/skeleton/styles/all.css";
	import "../theme.postcss";
	import "../app.postcss";

	import { page } from "$app/stores";
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { handleSession, getUser } from "@lucia-auth/sveltekit/client";
	import { AppShell, Drawer, Modal, Toast, drawerStore } from "@skeletonlabs/skeleton";

	import NavBar from "$lib/components/NavBar.svelte";
	import NavigationLoadingBar from "$lib/components/NavigationLoadingBar.svelte";

	handleSession(page);
	const user = getUser();
	let showNavigationLoadingBar = false;

	beforeNavigate(() => {
		showNavigationLoadingBar = true;
	});

	afterNavigate(() => {
		showNavigationLoadingBar = false;
	});

	$: navItems = [
		{
			label: "Home",
			href: "/"
		},
		{
			label: "My List",
			href: `/wishlists/${$user?.username}`
		},
		{
			label: "My Pledges",
			href: "/pledges"
		}
	];
</script>

<Drawer position="left">
	<div class="flex flex-row place-content-between mt-4 px-4 items-center">
		<span class="text-4xl">Wishlist</span>
		<button class="btn-icon" on:click={() => drawerStore.close()}>
			<iconify-icon icon="ri:close-fill" width="32" />
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
						class="list-option font-bold"
					>
						{navItem.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</Drawer>

<AppShell>
	<svelte:fragment slot="header">
		{#if showNavigationLoadingBar}
			<NavigationLoadingBar />
		{/if}
		<NavBar user={$user} {navItems} />
	</svelte:fragment>
	<!-- Router Slot -->
	<div class="px-4 md:px-8 py-4">
		<slot />
	</div>
</AppShell>

<Toast />
<Modal />
