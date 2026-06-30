<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
    import type { Item } from "$lib/generated/prisma/client";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";
    import { goto } from "$app/navigation";
    import Alert from "$lib/components/Alert.svelte";

    const { data }: PageProps = $props();
    const t = getFormatter();

    let itemData: Pick<Item, "name" | "price" | "url" | "note" | "imageUrl"> = {
        name: "",
        price: null,
        url: null,
        note: null,
        imageUrl: null
    };

    let warningHidden = $state(false);
    let saving = $state(false);

    const clearFields = () => {
        const fieldIds = [
            "url",
            "name",
            "price",
            "formatted-price",
            "quantity",
            "image",
            "imageUrl",
            "note",
            "unlimited"
        ];
        fieldIds.forEach((id) => {
            const field = document.getElementById(id) as HTMLInputElement;
            if (field) {
                if (id === "quantity") {
                    field.value = "1";
                } else if (id === "unlimited") {
                    field.checked = false;
                } else {
                    field.value = "";
                }
            }
        });
    };
</script>

{#if data.suggestion && data.suggestionMethod === "approval" && !warningHidden}
    <Alert title={$t("wishes.heads-up")} type="info">
        {$t("wishes.approval-required", { values: { listOwner: data.list.owner.name } })}
        {#snippet actions(variant)}
            <button class={["btn btn-sm", variant]} onclick={() => (warningHidden = true)}>
                {$t("general.ok")}
            </button>
        {/snippet}
    </Alert>
{/if}

<form
    enctype="multipart/form-data"
    method="POST"
    use:enhance={({ submitter }) => {
        saving = true;
        return async ({ result }) => {
            saving = false;
            if (result.type === "error") {
                toaster.error({ description: (result.error?.message as string) || $t("general.oops") });
                return;
            }
            if (result.type === "redirect") {
                toaster.info({ description: $t("wishes.item-created") });

                if (submitter?.id === "submit-stay") {
                    clearFields();
                    window.scrollTo({ top: 0 });
                    return;
                }
                return goto(result.location, { invalidateAll: true, replaceState: true });
            }
            await applyAction(result);
        };
    }}
>
    <ItemForm
        buttonText={$t("wishes.add-item")}
        currentList={data.list.id}
        item={itemData}
        lists={data.lists}
        {saving}
    />
</form>

<svelte:head>
    {#if data.list.owner.isMe}
        <title>{$t("wishes.create")}</title>
    {:else}
        <title>{$t("wishes.create-for", { values: { listOwner: data.list.owner.name } })}</title>
    {/if}
</svelte:head>
