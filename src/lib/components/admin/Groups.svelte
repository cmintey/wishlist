<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import Search from "../Search.svelte";
    import { GroupsAPI } from "$lib/api/groups";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "../toaster";
    import PromptModal from "../modals/PromptModal.svelte";

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

    const headers = [$t("auth.name"), $t("general.user-count")];

    let groupsFiltered: Group[] = $derived(groups);

    const selectionHandler = (group: Group) => {
        goto(`/admin/groups/${group.id}`);
    };

    const createGroup = async (name: string | undefined) => {
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
    };
</script>

<div class="mb-4 flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:gap-x-4">
    <Search data={groups} keys={["name"]} bind:result={groupsFiltered} />
    <PromptModal
        description={$t("general.provide-the-name-of-the-group-below")}
        inputProps={{ type: "text", minlength: 3, maxlength: 32, required: true }}
        onSubmit={createGroup}
        title={$t("general.enter-group-name")}
    >
        {#snippet trigger(props)}
            <button class="preset-filled-primary-500 btn" {...props}>
                <iconify-icon icon="ion:add"></iconify-icon>
                <p>{$t("general.create-group")}</p>
            </button>
        {/snippet}
    </PromptModal>
</div>

<div class="table-wrap preset-outlined-surface-200-800 rounded-container">
    <table class="table-hover table">
        <thead>
            <tr>
                {#each headers as header}
                    <th>{header}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each groupsFiltered as group}
                <tr onclick={() => selectionHandler(group)}>
                    <td>{group.name}</td>
                    <td>{group.userCount}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
