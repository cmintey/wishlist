<script lang="ts">
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import { isInstalled } from "$lib/stores/is-installed";
    import { Navigation } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        navItems: NavItem[];
        user: LocalUser | null;
    }

    const { navItems, user }: Props = $props();
    const t = getFormatter();

    const isSelected = (href: string) => {
        return page.url.href.endsWith(href);
    };
</script>

{#if user && $isInstalled}
    <Navigation class="bg-surface-200-800 bottom-nav" layout="bar">
        <Navigation.Menu class="flex justify-around">
            {#each navItems as navItem (navItem.labelKey)}
                {@const href = navItem.href(user)}
                <Navigation.TriggerAnchor
                    class={["hover:bg-primary-500/30 min-w-24 rounded-full", isSelected(href) && "bg-primary-500/20"]}
                    {href}
                >
                    <iconify-icon class="text-xl" icon={navItem.icon}></iconify-icon>
                    <Navigation.TriggerText>{$t(navItem.labelKey)}</Navigation.TriggerText>
                </Navigation.TriggerAnchor>
            {/each}
        </Navigation.Menu>
    </Navigation>
{/if}

<style>
    :global(.bottom-nav) {
        padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    }
</style>
