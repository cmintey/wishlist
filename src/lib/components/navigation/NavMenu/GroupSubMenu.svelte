<script lang="ts">
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { GroupsAPI } from "$lib/api/groups";
    import { UserAPI } from "$lib/api/users";
    import { getFormatter } from "$lib/i18n";
    import type { Group } from "@prisma/client";
    import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton";

    interface Props {
        user: LocalUser | undefined;
        groups: GroupInformation[] | null;
    }

    const { user, groups }: Props = $props();
    const t = getFormatter();

    const modalStore = getModalStore();

    let userAPI: UserAPI | undefined = $derived.by(() => {
        if (user) return new UserAPI(user.id);
    });

    const activeGroup = $derived(groups?.find((group) => group.active));

    const createGroup = () => {
        const settings: ModalSettings = {
            type: "prompt",
            title: $t("general.enter-group-name"),
            body: $t("general.provide-the-name-of-the-group-below"),
            valueAttr: { type: "text", minlength: 3, maxlength: 32, required: true },
            // Returns the updated response value
            response: async (name: string) => {
                const groupsAPI = new GroupsAPI();
                const group = await groupsAPI.create(name);
                if (userAPI) {
                    if (!activeGroup) await userAPI.setActiveGroup(group.id);
                }
                goto(resolve("/lists"), { invalidateAll: true });
            },
            // Optionally override the button text
            buttonTextCancel: $t("general.cancel"),
            buttonTextSubmit: $t("general.submit")
        };

        modalStore.trigger(settings);
    };

    const changeGroup = (groups: Group[]) => {
        const settings: ModalSettings = {
            type: "component",
            component: "groupSelect",
            meta: {
                groups
            },
            async response(groupId: string) {
                if (groupId) {
                    await userAPI?.setActiveGroup(groupId);
                    goto(resolve("/lists"), { invalidateAll: true });
                }
            },
            buttonTextCancel: $t("general.cancel")
        };
        modalStore.trigger(settings);
    };
</script>

{#if groups}
    {#each groups as group}
        {#if group.active}
            {#if groups.length > 1}
                <li>
                    <div class="flex w-fit max-w-[24ch] flex-row items-center gap-x-4 px-4 py-2 md:max-w-full">
                        <iconify-icon icon="ion:people"></iconify-icon>
                        <span class="truncate">{group.name}</span>
                    </div>
                </li>
            {/if}
            {#if group.isManager}
                <li>
                    <button class="list-option w-fit" onclick={() => goto(`/admin/groups/${group.id}`)}>
                        <iconify-icon icon="ion:settings"></iconify-icon>
                        <span>{$t("general.manage-group")}</span>
                    </button>
                </li>
            {/if}
        {/if}
    {/each}
    {#if groups.length > 1}
        <li>
            <button class="list-option w-fit" onclick={() => changeGroup(groups)}>
                <iconify-icon icon="ion:swap-horizontal"></iconify-icon>
                <span>{$t("general.change-group")}</span>
            </button>
        </li>
    {/if}
{/if}

<li>
    <button class="list-option w-fit" onclick={createGroup}>
        <iconify-icon icon="ion:add"></iconify-icon>
        <span>{$t("general.create-group")}</span>
    </button>
</li>
