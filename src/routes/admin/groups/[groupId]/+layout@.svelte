<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { Tab } from "@skeletonlabs/skeleton";
    import type { LayoutProps, Snapshot } from "./$types";
    import { GroupAPI } from "$lib/api/groups";
    import TabGroup from "$lib/components/Tab/TabGroup.svelte";
    import { getFormatter } from "$lib/i18n";
    import { resolve } from "$app/paths";

    const { data, children }: LayoutProps = $props();
    const t = getFormatter();

    const groupAPI = new GroupAPI(data.group.id);
    let editing = $state(false);
    let newGroupName: string | undefined = $state();
    const saveGroupName = async () => {
        if (newGroupName) {
            await groupAPI.update({ name: newGroupName });
            editing = !editing;
            await invalidateAll();
        }
    };

    const groupId = $derived(data.group.id);
    const tabs = [
        { href: () => resolve("/admin/groups/[groupId]/members", { groupId }), label: $t("admin.members") },
        { href: () => resolve("/admin/groups/[groupId]/settings", { groupId }), label: $t("admin.settings") }
    ];

    let selectedTab = $state(0);

    export const snapshot: Snapshot = {
        capture: () => selectedTab,
        restore: (value) => (selectedTab = value)
    };
</script>

<div class="flex flex-row items-center gap-x-2 pb-2">
    {#if editing}
        <div class="flex flex-row items-center gap-x-4">
            <input
                class="input w-fit"
                placeholder={data.group.name}
                title={$t("admin.group-name")}
                type="text"
                bind:value={newGroupName}
            />
            <button class="btn-icon w-fit p-0" aria-label={$t("a11y.save-group-name")} onclick={() => saveGroupName()}>
                <iconify-icon class="text-xl" icon="ion:save"></iconify-icon>
            </button>
            <button
                class="btn-icon w-fit p-0"
                aria-label={$t("a11y.cancel-editing")}
                onclick={() => (editing = !editing)}
            >
                <iconify-icon class="text-xl text-error-500" icon="ion:close"></iconify-icon>
            </button>
        </div>
    {:else}
        <h2 class="h2">{data.group.name}</h2>
        <button class="btn-icon" aria-label={$t("a11y.edit-group-name")} onclick={() => (editing = !editing)}>
            <iconify-icon class="text-xl" icon="ion:create-outline"></iconify-icon>
        </button>
    {/if}
</div>

<TabGroup>
    {#each tabs as { label, href }, value}
        <Tab name={label} {value} bind:group={selectedTab} on:change={() => goto(href(), { replaceState: true })}>
            {label}
        </Tab>
    {/each}

    {#snippet panel()}
        {@render children?.()}
    {/snippet}
</TabGroup>

<svelte:head>
    <title>{$t("admin.group-settings")}</title>
</svelte:head>
