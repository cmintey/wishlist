<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { type TableSource, type ModalSettings } from "@skeletonlabs/skeleton-svelte";
    import Search from "../Search.svelte";
    import { GroupsAPI } from "$lib/api/groups";
    import { getFormatter } from "$lib/i18n";

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
    const toastStore = getToastStore();

    let groupsFiltered: Group[] = $state(groups);

    let groupData: TableSource = $derived({
        head: [$t("auth.name"), $t("general.user-count")],
        body: tableMapperValues(groupsFiltered, ["name", "userCount"]),
        meta: tableSourceMapper(groupsFiltered, ["name", "id"])
    });

    const selectionHandler = (meta: CustomEvent<string[]>) => {
        const group: Group = meta.detail as unknown as Group;
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
                    toastStore.trigger({
                        message: $t("general.group-created-successfully")
                    });
                } else {
                    toastStore.trigger({
                        message: $t("errors.create-group-unknown-error")
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

{#if groupData}
    <Table interactive source={groupData} on:selected={selectionHandler} />
{/if}
