<script lang="ts">
    import type { PageProps } from "./$types";
    import ManageListForm from "$lib/components/wishlists/ManageListForm.svelte";
    import { page } from "$app/state";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { getFormatter } from "$lib/i18n";

    const { data }: PageProps = $props();
    const t = getFormatter();
    const toastStore = getToastStore();

    $effect(() => {
        if (page.form && !page.form.success && page.form.message) {
            toastStore.trigger({
                message: page.form.message,
                background: "variant-filled-error"
            });
        }
    });
</script>

<ManageListForm
    allowsPublicLists={data.allowsPublicLists}
    {data}
    editing
    listMode={data.listMode}
    persistButtonName={$t("general.save")}
/>

<svelte:head>
    <title>{$t("wishes.manage-list")}</title>
</svelte:head>
