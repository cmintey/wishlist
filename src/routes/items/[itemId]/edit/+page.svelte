<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import ItemForm from "#lib/components/wishlists/ItemForm.svelte";
    import type { PageProps } from "./$types";
    import { getFormatter } from "#lib/i18n.js";
    import { toaster } from "#lib/components/toaster/index.js";
    import { goto } from "$app/navigation";

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
            return async ({ result }) => {
                saving = false;
                if (result.type === "error") {
                    toaster.error({ description: (result.error?.message as string) || $t("general.oops") });
                    return;
                } else if (result.type === "redirect") {
                    toaster.info({ description: $t("wishes.updated-success") });
                    return goto(result.location, { refreshAll: true, replace: true });
                }
                await applyAction(result);
            };
        }}
    >
        <ItemForm buttonText={$t("general.save")} item={data.item} lists={data.lists} {saving} userId={data.user.id} />
    </form>
{/if}

<svelte:head>
    <title>{$t("wishes.edit-wish")}</title>
</svelte:head>
