<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { ItemsAPI } from "$lib/api/items";
    import { getFormatter } from "$lib/i18n";
    import { type ModalSettings } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        groupId?: string | undefined;
        claimed?: boolean;
    }

    const { groupId = undefined, claimed = false }: Props = $props();
    const t = getFormatter();

    const modalStore = getModalStore();
    const toastStore = getToastStore();
    const itemsAPI = new ItemsAPI();

    const handleDelete = async () => {
        const settings: ModalSettings = {
            type: "confirm",
            title: $t("general.please-confirm"),
            body: $t("admin.clear-lists-confirmation", {
                values: { claimedOnly: claimed, groupSpecific: groupId !== undefined }
            }),
            // confirm = TRUE | cancel = FALSE
            response: async (r: boolean) => {
                if (r) {
                    const resp = await itemsAPI.clearItemsFromLists(groupId, claimed);

                    if (resp.ok) {
                        invalidateAll();

                        toastStore.trigger({
                            message: $t("general.wishlists-cleared"),
                            autohide: true,
                            timeout: 5000
                        });
                    } else {
                        toastStore.trigger({
                            message: $t("general.oops"),
                            background: "preset-filled-warning-500",
                            autohide: true,
                            timeout: 5000
                        });
                    }
                }
            },
            buttonTextCancel: $t("general.cancel"),
            buttonTextConfirm: $t("general.confirm")
        };
        modalStore.trigger(settings);
    };
</script>

<button class="preset-filled-error-500 btn w-fit" onclick={handleDelete} type="button">
    {$t("admin.clear-lists", { values: { claimedOnly: claimed, groupSpecific: groupId !== undefined } })}
</button>
