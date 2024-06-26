<script lang="ts">
    import { AppBar, getDrawerStore, type DrawerSettings } from "@skeletonlabs/skeleton";
    import logo from "$lib/assets/logo.png";
    import { page } from "$app/stores";
    import NavMenu from "./NavMenu/NavMenu.svelte";
    import type { User } from "lucia";
    import { isInstalled } from "$lib/stores/is-installed";
    import BackButton from "../BackButton.svelte";

    export let navItems: NavItem[];
    export let user: User | null;

    const drawerStore = getDrawerStore();
    const drawerSettings: DrawerSettings = {
        id: "nav",
        position: "left",
        width: "w-[280px] md:w-[480px]"
    };
</script>

<AppBar background="bg-surface-200-700-token" padding="py-2 md:py-4 px-4">
    <svelte:fragment slot="lead">
        <div class="flex content-center items-center space-x-4">
            {#if user && !$isInstalled}
                {#if user}
                    <button class="btn btn-sm p-0 pt-0.5 md:hidden" on:click={() => drawerStore.open(drawerSettings)}>
                        <iconify-icon class="text-2xl" icon="ion:menu" />
                    </button>
                {/if}
                <a class="flex flex-row items-center space-x-2" href="/">
                    <img class="h-10 md:h-12" alt="Wishlist Logo" src={logo} />
                    <span class="text-primary-900-50-token text-2xl font-bold md:text-3xl">Wishlist</span>
                </a>
            {:else}
                <BackButton />
            {/if}
        </div>
    </svelte:fragment>

    {#if user}
        <div class="hidden flex-row items-center pl-4 pt-0.5 md:flex">
            {#each navItems as navItem}
                <a
                    class="list-option font-bold"
                    class:variant-filled-primary={$page.url.pathname === navItem.href}
                    data-sveltekit-preload-data
                    href={navItem.href}
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
