<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { ItemsAPI } from "$lib/api/items";
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton";

    interface Props {
        groupId?: string | undefined;
        claimed?: boolean;
    }

    let { groupId = undefined, claimed = false }: Props = $props();

    const modalStore = getModalStore();
    const toastStore = getToastStore();
    const itemsAPI = new ItemsAPI();

    const handleDelete = async () => {
        const settings: ModalSettings = {
            type: "confirm",
            title: "Please Confirm",
            body: `Are you sure you wish to clear ${claimed ? "claimed items" : "all wishlists"} ${
                groupId ? "in this group" : "across <b>all groups</b>"
            }? <b>This action is irreversible!</b>`,
            // confirm = TRUE | cancel = FALSE
            response: async (r: boolean) => {
                if (r) {
                    const resp = await itemsAPI.delete(groupId, claimed);

                    if (resp.ok) {
                        invalidateAll();

                        toastStore.trigger({
                            message: "Wishlists cleared.",
                            autohide: true,
                            timeout: 5000
                        });
                    } else {
                        toastStore.trigger({
                            message: `Oops! Something went wrong.`,
                            background: "variant-filled-warning",
                            autohide: true,
                            timeout: 5000
                        });
                    }
                }
            }
        };
        modalStore.trigger(settings);
    };
</script>

<button class="variant-filled-error btn w-fit" onclick={handleDelete} type="button">
    Clear {groupId ? "" : "All"}
    {claimed ? "Claimed Items" : "Lists"}
</button>
