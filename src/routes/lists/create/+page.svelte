<script lang="ts">
    import type { PageProps } from "./$types";
    import ManageListForm from "$lib/components/wishlists/ManageListForm.svelte";
    import { page } from "$app/state";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { getFormatter } from "$lib/i18n";

    const { data }: PageProps = $props();
    const t = getFormatter();

    $effect(() => {
        if (page.form && !page.form.success) {
            getToastStore().trigger({
                message: page.form.error || $t("errors.unable-to-create-list"),
                background: "variant-filled-error"
            });
        }
    });
</script>

<ManageListForm
    allowsPublicLists={data.allowsPublicLists}
    {data}
    listMode={data.listMode}
    persistButtonName={$t("general.create")}
/>

<svelte:head>
    <title>{$t("wishes.create-list")}</title>
</svelte:head>
