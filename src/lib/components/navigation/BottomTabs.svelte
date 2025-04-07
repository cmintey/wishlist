<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import { isInstalled } from "$lib/stores/is-installed";
    import { TabGroup, Tab } from "@skeletonlabs/skeleton";

    interface Props {
        navItems: NavItem[];
        user: LocalUser | null;
    }

    const { navItems, user }: Props = $props();
    const t = getFormatter();

    let tabsBottomNav: number | undefined = $state(navItems.findIndex((n) => page.url.pathname.startsWith(n.href)));
</script>

{#if user && $isInstalled}
    <TabGroup
        class="bottom-nav bg-surface-200-700-token w-full pt-4 md:hidden"
        active="variant-glass-primary"
        border=""
        hover="hover:variant-soft-primary"
        justify="justify-around"
        padding="px-6 py-2"
        rounded="rounded-full"
    >
        {#each navItems as navItem, value}
            <Tab
                name={$t(navItem.labelKey)}
                {value}
                bind:group={tabsBottomNav}
                on:click={() => goto(`${navItem.href}`)}
            >
                <iconify-icon class="text-xl" icon={navItem.icon}></iconify-icon>
            </Tab>
        {/each}
    </TabGroup>
{/if}

<style global>
    .bottom-nav {
        padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    }
</style>
