<script lang="ts">
	import "@skeletonlabs/skeleton/themes/theme-modern.css";
	import "@skeletonlabs/skeleton/styles/all.css";
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
	<div class="flex flex-col space-y-4 mx-4 mt-4">
		{#each navItems as navItem}
			<a
				class="btn btn-filled-primary"
				href={navItem.href}
				data-sveltekit-preload-data
				on:click={() => drawerStore.close()}><b>{navItem.label}</b></a
			>
		{/each}
	</div>
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
	<!-- ---- / ---- -->
	<svelte:fragment slot="pageFooter">
		<div class="flex justify-center">
			<span> Created with ❤️ in Minnesota </span>
		</div>
	</svelte:fragment>
</AppShell>

<Toast />
<Modal />
