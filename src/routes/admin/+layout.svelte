<script lang="ts">
    import { goto } from "$app/navigation";
    import { Tab } from "@skeletonlabs/skeleton";
    import type { LayoutProps, Snapshot } from "./$types";
    import TabGroup from "$lib/components/Tab/TabGroup.svelte";
    import { getFormatter } from "$lib/i18n";

    const { children }: LayoutProps = $props();
    const t = getFormatter();

    const tabs = [
        { href: "/users", label: $t("admin.users") },
        { href: "/groups", label: $t("admin.groups") },
        { href: "/settings", label: $t("admin.settings") },
        { href: "/actions", label: $t("admin.actions") },
        { href: "/about", label: $t("admin.about") }
    ];

    let selectedTab = $state(0);

    export const snapshot: Snapshot = {
        capture: () => selectedTab,
        restore: (value) => (selectedTab = value)
    };
</script>

<TabGroup>
    {#each tabs as { label, href }, value}
        <Tab
            name={label}
            {value}
            bind:group={selectedTab}
            on:change={() => goto(`/admin${href}`, { replaceState: true })}
        >
            {label}
        </Tab>
    {/each}

    {#snippet panel()}
        {@render children?.()}
    {/snippet}
</TabGroup>

<svelte:head>
    <title>{$t("admin.administration")}</title>
</svelte:head>
