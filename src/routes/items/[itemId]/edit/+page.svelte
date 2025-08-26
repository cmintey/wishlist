<script lang="ts">
    import { enhance } from "$app/forms";
    import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { errorToast } from "$lib/components/toasts";

    const { data }: PageProps = $props();

    const t = getFormatter();
    const toastStore = getToastStore();
</script>

{#if data.item}
    <form
        enctype="multipart/form-data"
        method="POST"
        use:enhance={() => {
            return async ({ result, update }) => {
                if (result.type === "error") {
                    errorToast(toastStore, (result.error?.message as string) || $t("general.oops"));
                    return;
                } else {
                    toastStore.trigger({
                        message: $t("wishes.updated-success"),
                        autohide: true,
                        timeout: 5000
                    });
                    update();
                }
            };
        }}
    >
        <ItemForm buttonText={$t("general.save")} item={data.item} lists={data.lists} />
    </form>
{/if}

<svelte:head>
    <title>{$t("wishes.edit-wish")}</title>
</svelte:head>
