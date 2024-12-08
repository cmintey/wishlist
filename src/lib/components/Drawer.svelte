<script lang="ts">
    import { Drawer, getDrawerStore } from "@skeletonlabs/skeleton";
    import NavigationDrawer from "./navigation/NavigationDrawer.svelte";
    import ItemDrawer from "./wishlists/ItemDrawer.svelte";
    import { navItems } from "./navigation/navigation";

    const drawerStore = getDrawerStore();
</script>

<Drawer>
    {#if $drawerStore.id === "nav"}
        {#await navItems then navItems}
            <NavigationDrawer {navItems} />
        {/await}
    {:else}
        <ItemDrawer />
    {/if}
</Drawer>
