<script lang="ts">
    import type { PageData } from "./$types";
    import { t } from "svelte-i18n";
    import ManageListForm from "$lib/components/wishlists/ManageListForm.svelte";
    import { page } from "$app/state";
    import { getToastStore } from "@skeletonlabs/skeleton";

    interface Props {
        data: PageData;
    }

    const { data }: Props = $props();

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
