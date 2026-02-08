<script lang="ts">
    import { enhance } from "$app/forms";
    import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";

    const { data }: PageProps = $props();

    const t = getFormatter();

    let saving = $state(false);
</script>

{#if data.item}
    <form
        enctype="multipart/form-data"
        method="POST"
        use:enhance={() => {
            saving = true;
            return async ({ result, update }) => {
                saving = false;
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
        <ItemForm buttonText={$t("general.save")} item={data.item} lists={data.lists} {saving} />
    </form>
{/if}

<svelte:head>
    <title>{$t("wishes.edit-wish")}</title>
</svelte:head>
