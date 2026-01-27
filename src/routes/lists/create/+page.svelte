<script lang="ts">
    import type { PageProps } from "./$types";
    import ManageListForm from "$lib/components/wishlists/ManageListForm.svelte";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";

    const { data }: PageProps = $props();
    const t = getFormatter();

    $effect(() => {
        if (page.form && !page.form.success) {
            toaster.error({ description: page.form.error || $t("errors.unable-to-create-list") });
        }
    });
</script>

<ManageListForm {...data} persistButtonName={$t("general.create")} />

<svelte:head>
    <title>{$t("wishes.create-list")}</title>
</svelte:head>
