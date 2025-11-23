<script lang="ts">
    import { getDrawerStore } from "@skeletonlabs/skeleton";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import logo from "$lib/assets/logo.png";

    interface Props {
        navItems: NavItem[];
    }

    const { navItems }: Props = $props();
    const t = getFormatter();

    const drawerStore = getDrawerStore();
    const user: LocalUser | undefined = $drawerStore.meta?.user;
</script>

<div class="mt-4 flex flex-row place-content-between items-center px-4">
    <div class="flex items-center gap-2">
        <img class="h-10 md:h-12" alt="Wishlist Logo" src={logo} />
        <span class="text-primary-900-50-token text-2xl font-bold md:text-3xl">Wishlist</span>
    </div>
    <button class="variant-ghost-surface btn-icon" aria-label={$t("a11y.close")} onclick={() => drawerStore.close()}>
        <iconify-icon class="text-xl" icon="ion:close"></iconify-icon>
    </button>
</div>
<nav class="list-nav p-4">
    <ul>
        {#each navItems as navItem}
            <li>
                <a
                    class="list-option gap-x-1 font-bold"
                    class:variant-filled-primary={page.url.pathname + page.url.search === navItem.href(user)}
                    data-sveltekit-preload-data
                    href={navItem.href(user)}
                    onclick={() => drawerStore.close()}
                >
                    <iconify-icon class="text-xl" icon={navItem.icon}></iconify-icon>
                    <p>{$t(navItem.labelKey)}</p>
                </a>
            </li>
        {/each}
    </ul>
</nav>
