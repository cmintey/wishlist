<script lang="ts">
    import type { PageProps } from "./$types";
    import ManageListForm from "$lib/components/wishlists/ManageListForm.svelte";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";

    const { data }: PageProps = $props();
    const t = getFormatter();

    $effect(() => {
        if (page.form && !page.form.success && page.form.message) {
            toaster.error({ description: page.form.message });
        }
    });
</script>

<ManageListForm {...data} editing persistButtonName={$t("general.save")} />

<svelte:head>
    <title>{$t("wishes.manage-list")}</title>
</svelte:head>
