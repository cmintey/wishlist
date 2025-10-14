<script lang="ts">
    import type { PageProps } from "./$types";
    import ManageListForm from "$lib/components/wishlists/ManageListForm.svelte";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";

    const { data }: PageProps = $props();
    const t = getFormatter();
    const toastStore = getToastStore();

    $effect(() => {
        if (page.form && !page.form.success && page.form.message) {
            toastStore.trigger({
                message: page.form.message,
                background: "preset-filled-error-500"
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
