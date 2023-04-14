<script lang="ts">
	import "@skeletonlabs/skeleton/styles/all.css";
	import "../theme.postcss";
	import "../app.postcss";

	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { AppShell, Modal, Toast, storePopup, type ModalComponent } from "@skeletonlabs/skeleton";
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from "@floating-ui/dom";

	import NavBar from "$lib/components/navigation/NavBar.svelte";
	import NavigationLoadingBar from "$lib/components/navigation/NavigationLoadingBar.svelte";
	import NavigationDrawer from "$lib/components/navigation/NavigationDrawer.svelte";
	import AddUserModal from "$lib/components/modals/AddUserModal.svelte";
	import GroupSelectModal from "$lib/components/modals/GroupSelectModal.svelte";
	import InviteUserModal from "$lib/components/modals/InviteUserModal.svelte";
	import type { LayoutData } from "./$types";
	import { writable, type Writable } from "svelte/store";
	import { getContext, onMount, setContext } from "svelte";
	import BottomTabs from "$lib/components/navigation/BottomTabs.svelte";

	export let data: LayoutData;

	let showNavigationLoadingBar = false;

	beforeNavigate(() => {
		showNavigationLoadingBar = true;
	});

	afterNavigate(() => {
		showNavigationLoadingBar = false;
	});

	setContext("nav", writable<boolean>(false));
	let isInstalled = getContext<Writable<boolean>>("nav");
	onMount(() => {
		if (window.matchMedia("(display-mode: standalone)").matches) {
			$isInstalled = true;
		}
	});

	$: navItems = [
		{
			label: "Home",
			href: "/",
			icon: "ion:home"
		},
		{
			label: "My Wishes",
			href: "/wishlists/me",
			icon: "ion:gift"
		},
		{
			label: "My Claims",
			href: "/claims",
			icon: "ion:albums"
		}
	] satisfies NavItem[];

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	const modalComponentRegistry: Record<string, ModalComponent> = {
		addUser: {
			ref: AddUserModal
		},
		groupSelect: {
			ref: GroupSelectModal
		},
		inviteUser: {
			ref: InviteUserModal
		}
	};
</script>

<NavigationDrawer {navItems} />

<AppShell>
	<svelte:fragment slot="header">
		{#if showNavigationLoadingBar}
			<NavigationLoadingBar />
		{/if}
		<NavBar {navItems} user={data.user} />
	</svelte:fragment>
	<!-- Router Slot -->
	<div class="px-4 py-4 md:px-12 lg:px-32 xl:px-56">
		<slot />
	</div>

	<svelte:fragment slot="footer">
		<BottomTabs {navItems} />
	</svelte:fragment>
</AppShell>

<Toast />
<Modal components={modalComponentRegistry} />
