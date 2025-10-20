<script lang="ts">
    import { enhance } from "$app/forms";
    import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";

    const { data }: PageProps = $props();

    const t = getFormatter();
</script>

{#if data.item}
    <form
        enctype="multipart/form-data"
        method="POST"
        use:enhance={() => {
            return async ({ result, update }) => {
                if (result.type === "error") {
                    toaster.error({ description: (result.error?.message as string) || $t("general.oops") });
                    return;
                } else {
                    toaster.info({ description: $t("wishes.updated-success") });
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
