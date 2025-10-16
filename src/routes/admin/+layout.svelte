<script lang="ts">
    import { goto } from "$app/navigation";
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import type { LayoutProps, Snapshot } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { resolve } from "$app/paths";

    const { children }: LayoutProps = $props();
    const t = getFormatter();

    const tabs = {
        users: { href: resolve("/admin/users"), label: $t("admin.users") },
        groups: { href: resolve("/admin/groups"), label: $t("admin.groups") },
        settings: { href: resolve("/admin/settings"), label: $t("admin.settings") },
        actions: { href: resolve("/admin/actions"), label: $t("admin.actions") },
        about: { href: resolve("/admin/about"), label: $t("admin.about") }
    };

    type TabOption = keyof typeof tabs;

    let selectedTab: TabOption = $state("users");

    async function onValueChange(value: TabOption) {
        selectedTab = value;
        return goto(tabs[value].href, { replaceState: true });
    }

    export const snapshot: Snapshot = {
        capture: () => selectedTab,
        restore: (value) => (selectedTab = value)
    };
</script>

<Tabs onValueChange={({ value }) => onValueChange(value as TabOption)} value={selectedTab}>
    <Tabs.List>
        {#each Object.entries(tabs) as [value, { label }]}
            <Tabs.Trigger {value}>
                {label}
            </Tabs.Trigger>
        {/each}
    </Tabs.List>
</Tabs>

{@render children?.()}

<svelte:head>
    <title>{$t("admin.administration")}</title>
</svelte:head>
