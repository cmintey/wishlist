<script lang="ts">
	import "@skeletonlabs/skeleton/styles/all.css";
	import "../theme.postcss";
	import "../app.postcss";

	import { page } from "$app/stores";
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { handleSession } from "@lucia-auth/sveltekit/client";
	import { AppShell, Modal, Toast, storePopup, type ModalComponent } from "@skeletonlabs/skeleton";
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from "@floating-ui/dom";

	import NavBar from "$lib/components/navigation/NavBar.svelte";
	import NavigationLoadingBar from "$lib/components/navigation/NavigationLoadingBar.svelte";
	import NavigationDrawer from "$lib/components/navigation/NavigationDrawer.svelte";
	import AddUserModal from "$lib/components/modals/AddUserModal.svelte";
	import GroupSelectModal from "$lib/components/modals/GroupSelectModal.svelte";
	import InviteUserModal from "$lib/components/modals/InviteUserModal.svelte";

	handleSession(page);
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
		<NavBar {navItems} />
	</svelte:fragment>
	<!-- Router Slot -->
	<div class="px-4 md:px-12 lg:px-32 xl:px-56 py-4">
		<slot />
	</div>
</AppShell>

<Toast />
<Modal components={modalComponentRegistry} />
