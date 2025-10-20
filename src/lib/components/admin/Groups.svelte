<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import Search from "../Search.svelte";
    import { GroupsAPI } from "$lib/api/groups";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "../toaster";

    type Group = {
        id: string;
        name: string;
        userCount: number;
    };

    interface Props {
        groups: Group[];
    }

    const { groups }: Props = $props();
    const t = getFormatter();

    const modalStore = getModalStore();

    const headers = [$t("auth.name"), $t("general.user-count")];

    let groupsFiltered: Group[] = $state(groups);

    const selectionHandler = (group: Group) => {
        goto(`/admin/groups/${group.id}`);
    };

    const createGroup = () => {
        const settings: ModalSettings = {
            type: "prompt",
            title: $t("general.enter-group-name"),
            body: $t("general.provide-the-name-of-the-group-below"),
            valueAttr: { type: "text", minlength: 3, maxlength: 32, required: true },
            // Returns the updated response value
            response: async (name: string) => {
                if (!name) {
                    return;
                }
                const groupsAPI = new GroupsAPI();
                const group = await groupsAPI.create(name);
                if (group) {
                    toaster.info({
                        description: $t("general.group-created-successfully")
                    });
                } else {
                    toaster.error({
                        description: $t("errors.create-group-unknown-error")
                    });
                }
                await invalidateAll();
            },
            buttonTextCancel: $t("general.cancel"),
            buttonTextSubmit: $t("general.submit")
        };

        modalStore.trigger(settings);
    };
</script>

<div class="mb-4 flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:gap-x-4">
    <Search data={groups} keys={["name"]} bind:result={groupsFiltered} />
    <button class="preset-filled-primary-500 btn" onclick={createGroup}>
        <iconify-icon icon="ion:add"></iconify-icon>
        <p>{$t("general.create-group")}</p>
    </button>
</div>

<div class="table-wrap">
    <table class="table">
        <thead>
            <tr>
                {#each headers as header}
                    <th>{header}</th>
                {/each}
            </tr>
        </thead>
        <tbody class="[&>tr]:hover:preset-tonal-primary">
            {#each groupsFiltered as group}
                <tr onclick={() => selectionHandler(group)}>
                    <td>{group.name}</td>
                    <td>{group.userCount}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
