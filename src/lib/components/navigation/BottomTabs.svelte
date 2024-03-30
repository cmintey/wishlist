<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { isInstalled } from "$lib/stores/is-installed";
    import { TabGroup, Tab } from "@skeletonlabs/skeleton";
    import type { User } from "lucia";

    export let navItems: NavItem[];
    export let user: User | null;

    let tabsBottomNav: number;

    tabsBottomNav = navItems.findIndex((n) => $page.url.pathname.startsWith(n.href));
</script>

{#if user && $isInstalled}
    <TabGroup
        class="bg-surface-200-700-token w-full pb-6 pt-4 md:hidden"
        active="variant-glass-primary"
        border=""
        hover="hover:variant-soft-primary"
        justify="justify-around"
        padding="px-6 py-2"
        rounded="rounded-full"
    >
        {#each navItems as navItem, value}
            <Tab name={navItem.label} {value} bind:group={tabsBottomNav} on:click={() => goto(`${navItem.href}`)}>
                <iconify-icon class="text-xl" icon={navItem.icon} />
            </Tab>
        {/each}
    </TabGroup>
{/if}
