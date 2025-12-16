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
        groups: GroupInformation[] | null;
        isProxyUser: boolean;
    }

    const { navItems, user, groups, isProxyUser }: Props = $props();
    const t = getFormatter();
</script>

{#snippet wishlistHeader()}
    <a class="flex flex-row items-center gap-x-2" href="/">
        <img class="size:h-12 aspect-square size-10 object-scale-down" alt="Wishlist Logo" src={logo} />
        <span
            class={[
                "text-primary-950-50 text-2xl font-bold md:text-3xl",
                groups && groups.length > 1 ? "hidden sm:block" : "block"
            ]}
        >
            Wishlist
        </span>
    </a>
{/snippet}

<div class="app-bar bg-surface-200-800 flex gap-4 px-4 py-2 md:py-4">
    <!-- Header -->
    <div class="flex flex-shrink-0 flex-grow content-center items-center gap-x-4 md:flex-grow-0">
        {#if user}
            {#if !$isInstalled}
                <button
                    class="btn btn-sm p-0 pt-0.5 md:hidden"
                    aria-label={$t("a11y.menu")}
                    onclick={() => drawerStore.open(drawerSettings)}
                >
                    <iconify-icon class="text-2xl" icon="ion:menu"></iconify-icon>
                </button>
                {@render wishlistHeader()}
            {:else}
                <BackButton header={wishlistHeader} />
            {/if}
        {:else}
            {@render wishlistHeader()}
        {/if}
    </div>

    <!-- Nav items -->
    {#if user}
        <div class="hidden flex-row items-center pt-0.5 pl-4 md:flex md:flex-grow">
            {#each navItems as navItem}
                <a
                    class="list-option font-bold"
                    class:preset-filled-primary-500y={page.url.pathname + page.url.search === navItem.href(user)}
                    data-sveltekit-preload-data
                    href={navItem.href(user)}
                >
                    {$t(navItem.labelKey)}
                </a>
            {/each}
        </div>
    {/if}

    <!-- Trail -->
    <NavMenu {groups} {isProxyUser} {user} />
</div>
