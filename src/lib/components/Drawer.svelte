<script lang="ts">
	import { Drawer, getDrawerStore } from "@skeletonlabs/skeleton";
	import NavigationDrawer from "./navigation/NavigationDrawer.svelte";
	import { navItems } from "./navigation/navigation";
	import ItemDrawer from "./wishlists/ItemDrawer.svelte";

	const drawerStore = getDrawerStore();
</script>

<Drawer>
	{#if $drawerStore.id === "nav"}
		<NavigationDrawer {navItems} />
	{:else}
		<ItemDrawer />
	{/if}
</Drawer>
