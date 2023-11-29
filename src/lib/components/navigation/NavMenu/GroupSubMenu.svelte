<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { GroupsAPI } from "$lib/api/groups";
    import { UserAPI } from "$lib/api/users";
    import type { Group } from "@prisma/client";
    import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton";
    import type { User } from "lucia";

    export let user: User | undefined;

    const modalStore = getModalStore();

    let userAPI: UserAPI;
    $: if (user) userAPI = new UserAPI(user.userId);

    const createGroup = () => {
        const settings: ModalSettings = {
            type: "prompt",
            title: "Enter Group Name",
            body: "Provide the name of the group below.",
            valueAttr: { type: "text", minlength: 3, maxlength: 32, required: true },
            // Returns the updated response value
            response: async (name: string) => {
                const groupsAPI = new GroupsAPI();
                const group = await groupsAPI.create(name);
                if (user && userAPI) {
                    const activeGroup = await userAPI.activeGroup();
                    if (!activeGroup) await userAPI.setActiveGroup(group.id);
                }
                await invalidateAll();
                await goto("/");
            },
            // Optionally override the button text
            buttonTextCancel: "Cancel",
            buttonTextSubmit: "Submit"
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
                    await userAPI.setActiveGroup(groupId);
                    await invalidateAll();
                }
            }
        };
        modalStore.trigger(settings);
    };
</script>

{#await userAPI.groups() then groups}
    {#each groups as group}
        {#if group.active}
            {#if groups.length > 1}
                <li>
                    <div class="flex w-fit flex-row items-center space-x-4 px-4 py-2">
                        <iconify-icon icon="ion:people" />
                        <span>{group.name}</span>
                    </div>
                </li>
            {/if}
            {#if group.isManager}
                <li>
                    <button class="list-option w-fit" on:click={() => goto(`/admin/groups/${group.id}`)}>
                        <iconify-icon icon="ion:settings" />
                        <span>Manage Group</span>
                    </button>
                </li>
            {/if}
        {/if}
    {/each}
    {#if groups.length > 1}
        <li>
            <button class="list-option w-fit" on:click={() => changeGroup(groups)}>
                <iconify-icon icon="ion:swap-horizontal" />
                <span>Change Group</span>
            </button>
        </li>
    {/if}
{/await}

<li>
    <button class="list-option w-fit" on:click={createGroup}>
        <iconify-icon icon="ion:add" />
        <span>Create Group</span>
    </button>
</li>
