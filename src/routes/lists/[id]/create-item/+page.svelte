<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
    import type { Item } from "@prisma/client";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { errorToast } from "$lib/components/toasts";

    const { data }: PageProps = $props();
    const t = getFormatter();
    const toastStore = getToastStore();

    let itemData: Pick<Item, "name" | "price" | "url" | "note" | "imageUrl"> = {
        name: "",
        price: null,
        url: null,
        note: null,
        imageUrl: null
    };

    let warningHidden = $state(false);

    const successToast = () =>
        toastStore.trigger({
            message: "Item created",
            autohide: true,
            timeout: 5000
        });

    const clearFields = () => {
        const fieldIds = ["url", "name", "price", "formatted-price", "quantity", "image", "imageUrl", "note"];
        fieldIds.forEach((id) => {
            const field = document.getElementById(id) as HTMLInputElement;
            if (field) {
                field.value = "";
            }
        });
    };
</script>

{#if data.suggestion && data.suggestionMethod === "approval" && !warningHidden}
    <div class="pb-4">
        <aside class="alert preset-tonal-warning border-warning-500 border">
            <div class="alert-message flex flex-row items-center space-y-0 gap-x-4">
                <span><iconify-icon class="text-4xl" icon="ion:warning"></iconify-icon></span>
                <div>
                    <span class="text-xl font-bold">{$t("wishes.heads-up")}</span>
                    <p class="text-sm">
                        {$t("wishes.approval-required", { values: { listOwner: data.list.owner.name } })}
                    </p>
                </div>
            </div>
            <div class="alert-actions">
                <button
                    class="preset-tonal-warning border-warning-500 btn btn-sm border"
                    onclick={() => (warningHidden = true)}
                >
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
