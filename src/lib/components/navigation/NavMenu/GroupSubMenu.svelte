<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { GroupsAPI } from "$lib/api/groups";
    import { UserAPI } from "$lib/api/users";
    import GroupSelectModal from "$lib/components/modals/GroupSelectModal.svelte";
    import PromptModal from "$lib/components/modals/PromptModal.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        user: LocalUser | undefined;
        groups: GroupInformation[] | null;
        onSelect: VoidFunction;
    }

    const { user, groups, onSelect }: Props = $props();
    const t = getFormatter();

    let userAPI: UserAPI | undefined = $derived.by(() => {
        if (user) return new UserAPI(user.id);
    });

    const activeGroup = $derived(groups?.find((group) => group.active));

    const createGroup = async (name: string | undefined) => {
        if (name) {
            const groupsAPI = new GroupsAPI();
            const group = await groupsAPI.create(name);
            if (user && userAPI) {
                if (!activeGroup) await userAPI.setActiveGroup(group.id);
            }
            goto(resolve("/lists"), { invalidateAll: true });
        }
    };

    const changeGroup = async (groupId: string | undefined) => {
        if (groupId) {
            await userAPI?.setActiveGroup(groupId);
            goto(resolve("/lists"), { invalidateAll: true });
        }
    };
</script>

{#if groups}
    {#each groups as group}
        {#if group.active}
            {#if groups.length > 1}
                <li>
                    <div class="flex w-full max-w-[24ch] flex-row items-center gap-x-4 px-4 py-2 md:max-w-full">
                        <iconify-icon icon="ion:people"></iconify-icon>
                        <span class="truncate">{group.name}</span>
                    </div>
                </li>
            {/if}
            {#if group.isManager}
                <li>
                    <a href={resolve("/admin/groups/[groupId]", { groupId: group.id })} onclick={onSelect}>
                        <iconify-icon icon="ion:settings"></iconify-icon>
                        <span>{$t("general.manage-group")}</span>
                    </a>
                </li>
            {/if}
        {/if}
    {/each}
    {#if groups.length > 1}
        <li>
            <GroupSelectModal {groups} onSubmit={changeGroup}>
                {#snippet trigger(props)}
                    <button
                        {...props}
                        class="list-option w-full"
                        onclick={(e) => {
                            onSelect();
                            props.onclick?.(e);
                        }}
                    >
                        <iconify-icon icon="ion:swap-horizontal"></iconify-icon>
                        <span>{$t("general.change-group")}</span>
                    </button>
                {/snippet}
            </GroupSelectModal>
        </li>
    {/if}
{/if}

<li>
    <PromptModal
        description={$t("general.provide-the-name-of-the-group-below")}
        inputProps={{ type: "text", minlength: 3, maxlength: 32, required: true }}
        onSubmit={createGroup}
        title={$t("general.enter-group-name")}
    >
        {#snippet trigger(props)}
            <button
                {...props}
                class="list-option w-full"
                onclick={(e) => {
                    onSelect();
                    props.onclick?.(e);
                }}
            >
                <iconify-icon icon="ion:add"></iconify-icon>
                <span>{$t("general.create-group")}</span>
            </button>
        {/snippet}
    </PromptModal>
</li>
