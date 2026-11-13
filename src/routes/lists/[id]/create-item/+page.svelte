<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
    import type { Item } from "$lib/generated/prisma/client";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";
    import { goto } from "$app/navigation";
    import Alert from "$lib/components/Alert.svelte";
    import { createItem } from "$lib/rpc/create-item.remote";

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

<form {...createItem} enctype="multipart/form-data">
    <ItemForm
        buttonText={$t("wishes.add-item")}
        currentList={data.list.id}
        item={itemData}
        lists={data.lists}
        {saving}
        userId={data.user.id}
    />
</form>

<svelte:head>
    {#if data.list.owner.isMe}
        <title>{$t("wishes.create")}</title>
    {:else}
        <title>{$t("wishes.create-for", { values: { listOwner: data.list.owner.name } })}</title>
    {/if}
</svelte:head>
