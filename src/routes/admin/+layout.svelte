<script lang="ts">
    import { goto } from "$app/navigation";
    import { Tab } from "@skeletonlabs/skeleton";
    import type { Snapshot } from "./$types";
    import TabGroup from "$lib/components/Tab/TabGroup.svelte";

    interface Props {
        children?: import("svelte").Snippet;
    }

    let { children }: Props = $props();

    const tabs = [
        { href: "/users", label: "Users" },
        { href: "/groups", label: "Groups" },
        { href: "/settings", label: "Settings" },
        { href: "/actions", label: "Actions" },
        { href: "/about", label: "About" }
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
    <title>Administration</title>
</svelte:head>
