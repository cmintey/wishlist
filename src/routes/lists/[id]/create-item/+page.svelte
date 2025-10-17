<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
    import type { Item } from "@prisma/client";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { errorToast } from "$lib/components/toasts";

    const { data }: PageProps = $props();
    const t = getFormatter();
    const toastStore = getToastStore();

    let itemData = $state<Pick<Item, "name" | "price" | "url" | "note" | "imageUrl" | "quantity">>({
        name: "",
        price: null,
        url: null,
        note: null,
        imageUrl: null,
        quantity: 1
    });

    let warningHidden = $state(false);

    const successToast = () =>
        toastStore.trigger({
            message: "Item created",
            autohide: true,
            timeout: 5000
        });

    const clearFields = () => {
        const fieldIds = ["url", "name", "price", "formatted-price", "image", "imageUrl", "note"];
        fieldIds.forEach((id) => {
            const field = document.getElementById(id) as HTMLInputElement;
            if (field) {
                field.value = "";
            }
        });
        
        // Reset the itemData object to initial state
        itemData.name = "";
        itemData.price = null;
        itemData.url = null;
        itemData.note = null;
        itemData.imageUrl = null;
        itemData.quantity = 1;
    };
</script>

{#if data.suggestion && data.suggestionMethod === "approval" && !warningHidden}
    <div class="pb-4">
        <aside class="alert variant-ghost-warning">
            <div class="alert-message flex flex-row items-center gap-x-4 space-y-0">
                <span><iconify-icon class="text-4xl" icon="ion:warning"></iconify-icon></span>
                <div>
                    <span class="text-xl font-bold">{$t("wishes.heads-up")}</span>
                    <p class="text-sm">
                        {$t("wishes.approval-required", { values: { listOwner: data.list.owner.name } })}
                    </p>
                </div>
            </div>
            <div class="alert-actions">
                <button class="variant-ghost-warning btn btn-sm" onclick={() => (warningHidden = true)}>
                    {$t("general.ok")}
                </button>
            </div>
        </aside>
    </div>
{/if}

<form
    enctype="multipart/form-data"
    method="POST"
    use:enhance={({ submitter }) => {
        return async ({ result }) => {
            if (result.type === "error") {
                errorToast(toastStore, (result.error?.message as string) || $t("general.oops"));
                return;
            }
            if (result.type === "success" || result.type === "redirect") {
                successToast();
            }
            if (result.type === "redirect" && submitter?.id === "submit-stay") {
                clearFields();
                window.scrollTo({ top: 0 });
                return;
            }
            await applyAction(result);
        };
    }}
>
    <ItemForm buttonText={$t("wishes.add-item")} currentList={data.list.id} item={itemData} lists={data.lists} />
</form>

<svelte:head>
    {#if data.list.owner.isMe}
        <title>{$t("wishes.create")}</title>
    {:else}
        <title>{$t("wishes.create-for", { values: { listOwner: data.list.owner.name } })}</title>
    {/if}
</svelte:head>
