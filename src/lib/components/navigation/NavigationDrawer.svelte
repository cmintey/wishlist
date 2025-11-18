<script lang="ts">
    import { getDrawerStore } from "@skeletonlabs/skeleton";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        navItems: NavItem[];
    }

    const { navItems }: Props = $props();
    const t = getFormatter();

    const drawerStore = getDrawerStore();
    const user: LocalUser | undefined = $drawerStore.meta?.user;
</script>

<div class="mt-4 flex flex-row place-content-between items-center px-4">
    <span class="text-4xl">Wishlist</span>
    <button class="btn-icon" aria-label={$t("a11y.close")} onclick={() => drawerStore.close()}>
        <iconify-icon icon="ion:close" width="32"></iconify-icon>
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
