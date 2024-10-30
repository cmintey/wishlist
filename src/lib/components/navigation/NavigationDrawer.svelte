<script lang="ts">
    import { getDrawerStore } from "@skeletonlabs/skeleton";
    import { page } from "$app/stores";

    interface Props {
        navItems: NavItem[];
    }

    let { navItems }: Props = $props();

    const drawerStore = getDrawerStore();
</script>

<div class="mt-4 flex flex-row place-content-between items-center px-4">
    <span class="text-4xl">Wishlist</span>
    <button class="btn-icon" aria-label="close" onclick={() => drawerStore.close()}>
        <iconify-icon icon="ion:close" width="32"></iconify-icon>
    </button>
</div>
<nav class="list-nav p-4">
    <ul>
        {#each navItems as navItem}
            <li>
                <a
                    class="list-option space-x-1 font-bold"
                    class:variant-filled-primary={$page.url.pathname === navItem.href}
                    data-sveltekit-preload-data
                    href={navItem.href}
                    onclick={() => drawerStore.close()}
                >
                    <iconify-icon class="text-xl" icon={navItem.icon}></iconify-icon>
                    <p>{navItem.label}</p>
                </a>
            </li>
        {/each}
    </ul>
</nav>
