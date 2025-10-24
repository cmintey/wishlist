<script lang="ts">
    import { goto } from "$app/navigation";
    import { GroupsAPI } from "$lib/api/groups";
    import { UserAPI } from "$lib/api/users";
    import GroupSelectModal from "$lib/components/modals/GroupSelectModal.svelte";
    import PromptModal from "$lib/components/modals/PromptModal.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        user: LocalUser | undefined;
    }

    const { user }: Props = $props();
    const t = getFormatter();

    let userAPI: UserAPI | undefined = $derived.by(() => {
        if (user) return new UserAPI(user.id);
    });

    const createGroup = async (name: string | undefined) => {
        if (name) {
            const groupsAPI = new GroupsAPI();
            const group = await groupsAPI.create(name);
            if (user && userAPI) {
                const activeGroup = await userAPI.activeGroup();
                if (!activeGroup) await userAPI.setActiveGroup(group.id);
            }
            goto("/", { invalidateAll: true });
        }
    };

    const changeGroup = async (groupId: string | undefined) => {
        if (groupId) {
            await userAPI?.setActiveGroup(groupId);
            await goto("/", { invalidateAll: true });
        }
    };
</script>

{#if userAPI}
    {#await userAPI.groups() then groups}
        {#each groups as group}
            {#if group.active}
                {#if groups.length > 1}
                    <li>
                        <div class="flex w-full flex-row items-center gap-x-4 px-4 py-2">
                            <iconify-icon icon="ion:people"></iconify-icon>
                            <span>{group.name}</span>
                        </div>
                    </li>
                {/if}
                {#if group.isManager}
                    <li>
                        <button class="list-option w-full" onclick={() => goto(`/admin/groups/${group.id}`)}>
                            <iconify-icon icon="ion:settings"></iconify-icon>
                            <span>{$t("general.manage-group")}</span>
                        </button>
                    </li>
                {/if}
            {/if}
        {/each}
        {#if groups.length > 1}
            <li>
                <GroupSelectModal {groups} onSubmit={changeGroup}>
                    {#snippet trigger(props)}
                        <button {...props} class="list-option w-full">
                            <iconify-icon icon="ion:swap-horizontal"></iconify-icon>
                            <span>{$t("general.change-group")}</span>
                        </button>
                    {/snippet}
                </GroupSelectModal>
            </li>
        {/if}
    {/await}
{/if}

<li>
    <PromptModal
        description={$t("general.provide-the-name-of-the-group-below")}
        inputProps={{ type: "text", minlength: 3, maxlength: 32, required: true }}
        onSubmit={createGroup}
        title={$t("general.enter-group-name")}
    >
        {#snippet trigger(props)}
            <button {...props} class="list-option w-full">
                <iconify-icon icon="ion:add"></iconify-icon>
                <span>{$t("general.create-group")}</span>
            </button>
        {/snippet}
    </PromptModal>
</li>
