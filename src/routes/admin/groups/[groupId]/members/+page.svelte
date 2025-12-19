<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { page } from "$app/state";
    import { GroupAPI } from "$lib/api/groups";
    import type { PageData, PageProps } from "./$types";
    import InviteUser from "$lib/components/admin/InviteUser.svelte";
    import ClearListsButton from "$lib/components/admin/Actions/ClearListsButton.svelte";
    import { enhance } from "$app/forms";
    import Alert from "$lib/components/Alert.svelte";
    import { getFormatter } from "$lib/i18n";
    import DeleteGroupModal from "$lib/components/modals/DeleteGroupModal.svelte";
    import ConfirmModal from "$lib/components/modals/ConfirmModal.svelte";
    import AddUserModal from "$lib/components/modals/AddUserModal.svelte";

    const { data }: PageProps = $props();
    const t = getFormatter();

    type UserData = PageData["group"]["users"][number];

    const groupAPI = new GroupAPI(data.group.id);
    const head = [$t("auth.name"), $t("auth.username"), $t("auth.email")];
    const dataKeys = ["name", "username", "email"] as (keyof UserData)[];

    const toggleManager = async (userId: string, isManager: boolean) => {
        if (isManager) await groupAPI.makeManager(userId);
        else await groupAPI.removeManager(userId);

        await invalidateAll();
    };

    const removeMember = async (userId: string) => {
        await groupAPI.removeMember(userId);
        await invalidateAll();
    };
</script>

{#if data.config.listMode !== "registry"}
    <div class="flex flex-wrap gap-2 py-4">
        <AddUserModal groupId={data.group.id}>
            {#snippet trigger(props)}
                <button class="preset-filled-primary-500 btn" type="button" {...props}>
                    <iconify-icon icon="ion:person-add"></iconify-icon>
                    <span>{$t("admin.add-member")}</span>
                </button>
            {/snippet}
        </AddUserModal>

        <form method="POST" use:enhance>
            <InviteUser config={data.config} defaultGroup={data.group} />
        </form>
    </div>
{:else}
    <Alert type="info">
        {@html $t("admin.registry-mode-alert-text")}
    </Alert>
{/if}

<div class="flex flex-col space-y-2">
    <div class="table-wrap">
        <table class="table" role="grid">
            <thead>
                <tr>
                    {#each head as label}
                        <th>
                            {label}
                        </th>
                    {/each}
                    <th>{$t("admin.manager")}</th>
                    <th>{$t("general.remove")}</th>
                </tr>
            </thead>
            <tbody class="[&>tr]:hover:preset-tonal-primary">
                {#each data.group.users as user, row}
                    {@const isManager = !user.isGroupManager}
                    <tr aria-rowindex={row}>
                        {#each dataKeys as key, col}
                            <td aria-colindex={col} role="gridcell" tabindex={col === 0 ? 0 : -1}>
                                {user[key]}
                            </td>
                        {/each}
                        <td>
                            <ConfirmModal
                                onConfirm={() => toggleManager(user.id, isManager)}
                                title={$t("admin.add-remove-manager-title", { values: { isManager } })}
                            >
                                {#snippet description()}
                                    {$t("admin.add-remove-manager-message", { values: { isManager } })}
                                {/snippet}
                                {#snippet trigger(props)}
                                    <button class="btn-icon" {...props}>
                                        <iconify-icon icon="ion:sparkles{!isManager ? '' : '-outline'}"></iconify-icon>
                                    </button>
                                {/snippet}
                            </ConfirmModal>
                        </td>
                        <td aria-colindex={dataKeys.length} role="gridcell" tabindex={-1}>
                            <ConfirmModal
                                onConfirm={() => removeMember(user.id)}
                                title={$t("admin.remove-member-title")}
                            >
                                {#snippet description()}
                                    {@html $t("admin.remove-member-message")}
                                {/snippet}
                                {#snippet trigger(props)}
                                    <button
                                        class="btn-icon"
                                        aria-label={$t("a11y.remove-user-from-group", { values: { user: user.name } })}
                                        {...props}
                                    >
                                        <iconify-icon icon="ion:person-remove"></iconify-icon>
                                    </button>
                                {/snippet}
                            </ConfirmModal>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="flex flex-wrap gap-2">
        <DeleteGroupModal defaultGroup={data.config.defaultGroup} groupId={data.group.id} />
        <ClearListsButton groupId={page.params.groupId} />
        <ClearListsButton claimed groupId={page.params.groupId} />
    </div>
</div>
