<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import type { LayoutProps, Snapshot } from "./$types";
    import { GroupAPI } from "$lib/api/groups";
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
    const tabs = {
        members: { href: () => resolve("/admin/groups/[groupId]/members", { groupId }), label: $t("admin.members") },
        settings: { href: () => resolve("/admin/groups/[groupId]/settings", { groupId }), label: $t("admin.settings") }
    };

    type TabOption = keyof typeof tabs;

    let selectedTab: TabOption = $state("members");

    async function onValueChange(value: TabOption) {
        selectedTab = value;
        return goto(tabs[value].href(), { replaceState: true });
    }

    export const snapshot: Snapshot = {
        capture: () => selectedTab,
        restore: (value) => (selectedTab = value)
    };
</script>

<div class="flex flex-row items-center gap-x-2">
    {#if editing}
        <input
            class="input w-fit"
            placeholder={data.group.name}
            title={$t("admin.group-name")}
            type="text"
            bind:value={newGroupName}
        />
        <div class="-gap-x-2 flex flex-row items-center">
            <button class="btn-icon pr-0" aria-label={$t("a11y.save-group-name")} onclick={() => saveGroupName()}>
                <iconify-icon icon="ion:save" width="24px"></iconify-icon>
            </button>
            <button class="btn-icon pl-0" aria-label={$t("a11y.cancel-editing")} onclick={() => (editing = !editing)}>
                <iconify-icon class="text-error-500" icon="ion:close" width="24px"></iconify-icon>
            </button>
        </div>
    {:else}
        <h2 class="h2 pb-2">{data.group.name}</h2>
        <button class="btn-icon" aria-label={$t("a11y.edit-group-name")} onclick={() => (editing = !editing)}>
            <iconify-icon icon="ion:create-outline" width="24px"></iconify-icon>
        </button>
    {/if}
</div>

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
    <title>{$t("admin.group-settings")}</title>
</svelte:head>
