<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { ItemsAPI } from "$lib/api/items";
    import { toaster } from "$lib/components/toaster";
    import { getFormatter } from "$lib/i18n";
    import { type ModalSettings } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        groupId?: string | undefined;
        claimed?: boolean;
    }

    const { groupId = undefined, claimed = false }: Props = $props();
    const t = getFormatter();

    const modalStore = getModalStore();
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

                        toaster.info({ description: $t("general.wishlists-cleared") });
                    } else {
                        toaster.error({ description: $t("general.oops") });
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
