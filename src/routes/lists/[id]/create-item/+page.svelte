<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
    import type { Item } from "@prisma/client";
    import type { PageProps } from "./$types";
    import { getFormatter } from "$lib/i18n";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { errorToast } from "$lib/components/toasts";
    import { goto } from "$app/navigation";

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
    let saving = $state(false);

    const successToast = () =>
        toastStore.trigger({
            message: "Item created",
            autohide: true,
            timeout: 5000
        });

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
        saving = true;
        return async ({ result }) => {
            saving = false;
            if (result.type === "error") {
                errorToast(toastStore, (result.error?.message as string) || $t("general.oops"));
                return;
            }
            if (result.type === "redirect") {
                successToast();

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
