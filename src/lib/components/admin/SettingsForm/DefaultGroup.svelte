<script lang="ts">
    import BaseSetting from "./BaseSetting.svelte";

    type Group = {
        id: string;
        name: string;
    };

    interface Props {
        groupId?: string | null;
        groups: Group[];
    }

    let { groupId = $bindable(), groups = [] }: Props = $props();
</script>

<BaseSetting title="Default group">
    <select id="defaultGroup" name="defaultGroup" class="select w-fit min-w-64" bind:value={groupId}>
        <option value="">Select a group</option>
        {#each groups as group}
            <option value={group.id}>{group.name}</option>
        {/each}
    </select>
</BaseSetting>
