<script lang="ts">
    import { AppBar, getDrawerStore, type DrawerSettings } from "@skeletonlabs/skeleton";
    import logo from "$lib/assets/logo.png";
    import { page } from "$app/state";
    import NavMenu from "./NavMenu/NavMenu.svelte";
    import { isInstalled } from "$lib/stores/is-installed";
    import BackButton from "../BackButton.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        navItems: NavItem[];
        user: LocalUser | null;
        groups: GroupInformation[] | null;
        isProxyUser: boolean;
    }

    const { navItems, user, groups, isProxyUser }: Props = $props();
    const t = getFormatter();

    const drawerStore = getDrawerStore();
    const drawerSettings: DrawerSettings = {
        id: "nav",
        position: "left",
        width: "w-[280px] md:w-[480px]",
        meta: {
            user
        }
    };
</script>

{#snippet wishlistHeader()}
    <a class="flex flex-row items-center gap-x-2" href="/">
        <img class="h-10 md:h-12" alt="Wishlist Logo" src={logo} />
        <span class="text-primary-900-50-token hidden text-2xl font-bold sm:block md:text-3xl">Wishlist</span>
    </a>
{/snippet}

<AppBar background="bg-surface-200-700-token" padding="py-2 md:py-4 px-4">
    {#snippet lead()}
        <div class="flex content-center items-center gap-x-4">
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
                    <BackButton />
                {/if}
            {:else}
                {@render wishlistHeader()}
            {/if}
        </div>
    {/snippet}

    {#if user}
        <div class="hidden flex-row items-center pl-4 pt-0.5 md:flex">
            {#each navItems as navItem}
                <a
                    class="list-option font-bold"
                    class:variant-filled-primary={page.url.pathname + page.url.search === navItem.href(user)}
                    data-sveltekit-preload-data
                    href={navItem.href(user)}
                >
                    {$t(navItem.labelKey)}
                </a>
            {/each}
        </div>
    {/if}

    {#snippet trail()}
        <NavMenu {groups} {isProxyUser} {user} />
    {/snippet}
</AppBar>
