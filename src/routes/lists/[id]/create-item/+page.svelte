<script lang="ts">
    import { enhance } from "$app/forms";
    import ItemForm from "$lib/components/wishlists/ItemForm.svelte";
    import type { Item } from "@prisma/client";
    import type { PageData } from "./$types";
    import { t } from "svelte-i18n";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    let itemData: Pick<Item, "name" | "price" | "url" | "note" | "imageUrl"> = {
        name: "",
        price: null,
        url: null,
        note: null,
        imageUrl: null
    };

    let warningHidden = $state(false);
</script>

{#if data.suggestion && data.suggestionMethod === "approval" && !warningHidden}
    <div class="pb-4">
        <aside class="alert variant-ghost-warning">
            <div class="alert-message flex flex-row items-center space-y-0 space-x-4">
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

<form enctype="multipart/form-data" method="POST" use:enhance>
    <ItemForm buttonText={$t("wishes.add-item")} currentList={data.list.id} item={itemData} lists={data.lists} />
</form>

<svelte:head>
    {#if data.list.owner.isMe}
        <title>{$t("wishes.create")}</title>
    {:else}
        <title>{$t("wishes.create-for", { values: { listOwner: data.list.owner.name } })}</title>
    {/if}
</svelte:head>
