<script lang="ts">
    import { AppBar } from "@skeletonlabs/skeleton-svelte";
    import logo from "$lib/assets/logo.png";
    import { page } from "$app/state";
    import NavMenu from "./NavMenu/NavMenu.svelte";
    import { isInstalled } from "$lib/stores/is-installed";
    import BackButton from "../BackButton.svelte";
    import { getFormatter } from "$lib/i18n";
    import NavigationDrawer from "./NavigationDrawer.svelte";

    interface Props {
        navItems: NavItem[];
        user: LocalUser | null;
        isProxyUser: boolean;
    }

    const { navItems, user, isProxyUser }: Props = $props();
    const t = getFormatter();
</script>

{#snippet wishlistHeader()}
    <a class="flex flex-row items-center gap-x-2" href="/">
        <img class="h-10 md:h-12" alt="Wishlist Logo" src={logo} />
        <span class="text-primary-950-50 text-2xl font-bold md:text-3xl">Wishlist</span>
    </a>
{/snippet}

<AppBar class="bg-surface-200-800 app-bar">
    <AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
        <AppBar.Lead>
            {#snippet element(props)}
                <div class={["flex content-center items-center gap-x-4", props.class]}>
                    {#if user}
                        {#if !$isInstalled}
                            <NavigationDrawer {navItems}>
                                {#snippet trigger(props)}
                                    <button
                                        class="btn btn-sm p-0 pt-0.5 md:hidden"
                                        aria-label={$t("a11y.menu")}
                                        {...props}
                                    >
                                        <iconify-icon class="text-2xl" icon="ion:menu"></iconify-icon>
                                    </button>
                                {/snippet}
                            </NavigationDrawer>

                            {@render wishlistHeader()}
                        {:else}
                            <BackButton />
                        {/if}
                    {:else}
                        {@render wishlistHeader()}
                    {/if}
                </div>
            {/snippet}
        </AppBar.Lead>

        {#if user}
            <AppBar.Headline class="hidden flex-row items-center pt-0.5 pl-4 md:flex">
                {#each navItems as navItem}
                    <a
                        class="list-option font-bold"
                        class:preset-filled-primary-500={page.url.pathname === navItem.href}
                        data-sveltekit-preload-data
                        href={navItem.href}
                    >
                        {$t(navItem.labelKey)}
                    </a>
                {/each}
            </AppBar.Headline>
        {/if}

        <AppBar.Trail>
            {#snippet element()}
                <NavMenu {isProxyUser} {user} />
            {/snippet}
        </AppBar.Trail>
    </AppBar.Toolbar>
</AppBar>
