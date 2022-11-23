<script lang="ts">
	import "@brainandbones/skeleton/themes/theme-modern.css";
	import "@brainandbones/skeleton/styles/all.css";
	import "../app.postcss";

	import { writable, type Writable } from "svelte/store";
	import { page } from "$app/stores";
	import { handleSession, getUser } from "@lucia-auth/sveltekit/client";
	import { AppShell, Drawer, Modal, Toast } from "@brainandbones/skeleton";
	import NavBar from "$lib/components/NavBar.svelte";

	handleSession(page);
	const user = getUser();

	const drawer: Writable<boolean> = writable(false);

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

<Drawer open={drawer} position="left">
	<div class="flex flex-col space-y-4 mx-4 mt-4">
		{#each navItems as navItem}
			<a
				class="btn bg-primary-500"
				href={navItem.href}
				on:click={() => drawer.update((val) => !val)}><b>{navItem.label}</b></a
			>
		{/each}
	</div>
</Drawer>

<AppShell>
	<svelte:fragment slot="header">
		<NavBar user={$user} {navItems} {drawer} />
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
