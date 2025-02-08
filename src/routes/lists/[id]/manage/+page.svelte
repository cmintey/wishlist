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
    const toastStore = getToastStore();

    $effect(() => {
        $inspect(page.form);
        if (page.form && !page.form.success && page.form.message) {
            toastStore.trigger({
                message: page.form.message,
                background: "variant-filled-error"
            });
        }
    });
</script>

<ManageListForm {data} editing persistButtonName={$t("general.save")} />

<svelte:head>
    <title>{$t("wishes.manage-list")}</title>
</svelte:head>
