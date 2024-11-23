<script lang="ts">
    import { enhance } from "$app/forms";
    import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import type { PageServerData } from "./$types";
    import { t } from "svelte-i18n";

    interface Props {
        data: PageServerData;
    }

    let { data }: Props = $props();

    const toastStore = getToastStore();
</script>

{#if data?.item}
    <form
        enctype="multipart/form-data"
        method="POST"
        use:enhance={() => {
            // loading = true;
            return async ({ update }) => {
                const c = {
                    message: $t("wishes.updated-success"),
                    autohide: true,
                    timeout: 5000
                };
                toastStore.trigger(c);
                update();
            };
        }}
    >
        <ItemForm buttonText="Save" data={data?.item} />
    </form>
{/if}

<svelte:head>
    <title>$t('wishes.edit-wish')</title>
</svelte:head>
