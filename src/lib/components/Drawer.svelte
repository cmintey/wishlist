<script lang="ts">
    import { Drawer, getDrawerStore } from "@skeletonlabs/skeleton";
    import NavigationDrawer from "./navigation/NavigationDrawer.svelte";
    import ItemDrawer from "./wishlists/ItemDrawer.svelte";
    import { navItems } from "./navigation/navigation";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    const drawerStore = getDrawerStore();

    const handleUnfocus = () => {
        if ($drawerStore.id === "item") {
            goto(page.url.pathname, { replaceState: true, noScroll: true });
        }
    };
</script>

<Drawer on:backdrop={handleUnfocus}>
    {#if $drawerStore.id === "nav"}
        <NavigationDrawer {navItems} />
    {:else}
        <ItemDrawer />
    {/if}
</Drawer>
