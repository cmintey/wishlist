<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { Tab, TabGroup } from "@skeletonlabs/skeleton";
    import type { LayoutData, Snapshot } from "./$types";
    import { page } from "$app/stores";
    import { GroupAPI } from "$lib/api/groups";

    export let data: LayoutData;

    const groupAPI = new GroupAPI(data.group.id);
    let editing = false;
    let newGroupName: string;
    const saveGroupName = async () => {
        if (newGroupName) {
            await groupAPI.update({ name: newGroupName });
            editing = !editing;
            await invalidateAll();
        }
    };

    const tabs = [
        { href: "/members", label: "Members" },
        { href: "/settings", label: "Settings" }
    ];

    let selectedTab = 0;

    export const snapshot: Snapshot = {
        capture: () => selectedTab,
        restore: (value) => (selectedTab = value)
    };
</script>

<div class="flex flex-row items-center space-x-2">
    {#if editing}
        <input
            class="input w-fit"
            placeholder={data.group.name}
            title="Group Name"
            type="text"
            bind:value={newGroupName}
        />
        <div class="flex flex-row items-center -space-x-2">
            <button class="btn-icon pr-0" on:click={() => saveGroupName()}>
                <iconify-icon icon="ion:save" width="24px"></iconify-icon>
            </button>
            <button class="btn-icon pl-0" on:click={() => (editing = !editing)}>
                <iconify-icon class="text-error-500" icon="ion:close" width="24px"></iconify-icon>
            </button>
        </div>
    {:else}
        <h2 class="h2 pb-2">{data.group.name}</h2>
        <button class="btn-icon" on:click={() => (editing = !editing)}>
            <iconify-icon icon="ion:create-outline" width="24px"></iconify-icon>
        </button>
    {/if}
</div>

<TabGroup>
    {#each tabs as { label, href }, value}
        <Tab
            name={label}
            {value}
            bind:group={selectedTab}
            on:change={() => goto(`/admin/groups/${$page.params.groupId}${href}`, { replaceState: true })}
        >
            {label}
        </Tab>
    {/each}

    <svelte:fragment slot="panel">
        <slot />
    </svelte:fragment>
</TabGroup>

<svelte:head>
    <title>Group Settings</title>
</svelte:head>
