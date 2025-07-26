<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/state";
    import { GroupAPI } from "$lib/api/groups";
    import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton";
    import type { PageData, PageProps } from "./$types";
    import InviteUser from "$lib/components/admin/InviteUser.svelte";
    import ClearListsButton from "$lib/components/admin/Actions/ClearListsButton.svelte";
    import { enhance } from "$app/forms";
    import Alert from "$lib/components/Alert.svelte";
    import { getFormatter } from "$lib/i18n";

    const { data }: PageProps = $props();
    const t = getFormatter();

    const modalStore = getModalStore();

    type UserData = PageData["group"]["users"][number];

    const groupAPI = new GroupAPI(page.params.groupId);
    const head = [$t("auth.name"), $t("auth.username"), $t("auth.email")];
    const dataKeys = ["name", "username", "email"] as (keyof UserData)[];

    const addUserModalSettings: ModalSettings = {
        type: "component",
        component: "addUser",
        response: async (userId: string) => {
            if (userId) {
                await groupAPI.addMember(userId);
                invalidateAll();
            }
        },
        buttonTextCancel: $t("general.cancel")
    };

    const toggleManager = async (userId: string, isManager: boolean) => {
        modalStore.trigger({
            type: "confirm",
            title: $t("admin.add-remove-manager-title", { values: { isManager } }),
            body: $t("admin.add-remove-manager-message", { values: { isManager } }),
            async response(r) {
                if (!r) return;

                if (isManager) await groupAPI.makeManager(userId);
                else await groupAPI.removeManager(userId);

                await invalidateAll();
            },
            buttonTextCancel: $t("general.cancel"),
            buttonTextConfirm: $t("general.confirm")
        });
    };

    const removeMember = (userId: string) => {
        modalStore.trigger({
            type: "confirm",
            title: $t("admin.remove-member-title"),
            body: $t("admin.remove-member-message"),
            async response(r) {
                if (!r) return;

                await groupAPI.removeMember(userId);
                await invalidateAll();
            },
            buttonTextCancel: $t("general.cancel"),
            buttonTextConfirm: $t("general.confirm")
        });
    };

    const deleteGroup = () => {
        if (data.config.defaultGroup === page.params.groupId) {
            modalStore.trigger({
                type: "alert",
                title: $t("errors.cannot-delete-default-group"),
                body: $t("general.cannot-delete-default-group-msg"),
                buttonTextCancel: $t("general.ok")
            });
            return;
        }
        modalStore.trigger({
            type: "confirm",
            title: $t("admin.delete-group-title"),
            body: $t("admin.delete-group-message"),
            async response(r) {
                if (!r) return;

                const group = await groupAPI.delete();
                if (group) {
                    await invalidateAll();
                    goto("/");
                }
            },
            buttonTextCancel: $t("general.cancel"),
            buttonTextConfirm: $t("general.confirm")
        });
    };
</script>

{#if data.config.listMode !== "registry"}
    <div class="flex gap-x-4 py-4">
        <button
            class="variant-filled-primary btn"
            onclick={() => modalStore.trigger(addUserModalSettings)}
            type="button"
        >
            <iconify-icon icon="ion:person-add"></iconify-icon>
            <span>{$t("admin.add-member")}</span>
        </button>
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
    <div class="table-container">
        <table class="table table-interactive" role="grid">
            <thead class="table-head">
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
            <tbody class="table-body">
                {#each data.group.users as user, row}
                    <tr aria-rowindex={row}>
                        {#each dataKeys as key, col}
                            <td aria-colindex={col} role="gridcell" tabindex={col === 0 ? 0 : -1}>
                                {user[key]}
                            </td>
                        {/each}
                        <td>
                            <button
                                class="btn-icon"
                                aria-label={$t("a11y.toggle-manager", {
                                    values: { isManager: user.isGroupManager, user: user.name }
                                })}
                                onclick={() => toggleManager(user.id, !user.isGroupManager)}
                            >
                                <iconify-icon icon="ion:sparkles{user.isGroupManager ? '' : '-outline'}"></iconify-icon>
                            </button>
                        </td>
                        <td aria-colindex={dataKeys.length} role="gridcell" tabindex={-1}>
                            <button
                                class="btn-icon"
                                aria-label={$t("a11y.remove-user-from-group", { values: { user: user.name } })}
                                onclick={() => removeMember(user.id)}
                            >
                                <iconify-icon icon="ion:person-remove"></iconify-icon>
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div>
        <button class="variant-filled-error btn w-fit" onclick={deleteGroup}>{$t("admin.delete-group-title")}</button>
        <ClearListsButton groupId={page.params.groupId} />
        <ClearListsButton claimed groupId={page.params.groupId} />
    </div>
</div>
