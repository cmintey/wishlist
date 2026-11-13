<script lang="ts">
    import { page } from "$app/state";
    import type { Group, Item, ItemPrice, List, User } from "$lib/generated/prisma/client";
    import Backdrop from "$lib/components/Backdrop.svelte";
    import CurrencyInput from "../CurrencyInput.svelte";
    import { onMount } from "svelte";
    import { getFormatter } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import MarkdownEditor from "../MarkdownEditor.svelte";
    import FileUpload from "../FileUpload.svelte";
    import { toaster } from "../toaster";
    import ListSelector from "./ListSelector.svelte";
    import { createItem } from "$lib/rpc/create-item.remote";

    interface ListProps extends Pick<List, "id" | "name" | "public"> {
        owner: Pick<User, "name">;
        group: Pick<Group, "name">;
    }

    interface ExistingListProps extends Pick<List, "id"> {
        canModify: boolean;
    }

    interface Props {
        userId: string;
        item: Partial<Item> & {
            itemPrice?: ItemPrice | null;
            lists?: ExistingListProps[];
        };
        lists?: {
            usersLists: ListProps[];
            managedLists: ListProps[];
        };
        currentList?: string;
        buttonText: string;
        saving: boolean;
    }

    let { userId, item = $bindable(), buttonText, lists: otherLists, currentList, saving = false }: Props = $props();
    const t = getFormatter();

    let productData = $state(item);
    let form = $derived(page.form);
    let url = $derived(page.url);
    let fetching = $state(false);
    let urlFetched = $state(false);
    // let price: number | undefined = $state(
    //     getPriceValueFromMinor(
    //         createItem.fields.price.value(),
    //         createItem.fields.currency.value() || defaultCurrency
    //     ) || undefined
    // );
    let quantity = $state(item.quantity || 1);
    let unlimited = $state(item.quantity === null);
    let submitSrc = $state("submit");

    const extractUrl = (url: string) => {
        const urlRegex = /(https?):\/\/[^\s/$.?#].[^\s]*/;
        const matches = url.match(urlRegex);
        if (matches) {
            return encodeURIComponent(matches[0]);
        }
        return null;
    };

    const triggerToast = () => {
        toaster.warning({ description: $t("errors.unable-to-find-product-information") });
    };

    const getInfo = async (productUrl: string | undefined | null) => {
        if (productUrl && !urlFetched) {
            fetching = true;
            const url = extractUrl(productUrl) || undefined;
            const res = await fetch(`/api/product?url=${url}`);
            if (res.ok) {
                let newProductData: ProductData = await res.json();
                //TODO: use function to update
                createItem.fields.url.set(newProductData.url ?? url);
                createItem.fields.name.set(newProductData.name ?? newProductData.title ?? undefined);
                if (newProductData.image) {
                    try {
                        const imageUrl = new URL(newProductData.image);
                        createItem.fields.imageUrl.set(imageUrl.href);
                    } catch {
                        if (newProductData.url) {
                            try {
                                const url = new URL(newProductData.url);
                                const imageUrl = new URL(newProductData.image, url);
                                createItem.fields.imageUrl.set(imageUrl.href);
                            } catch {
                                // invalid image, stop strying to make it work
                            }
                        }
                    }
                }

                if (newProductData.price) {
                    createItem.fields.currency.set(newProductData.currency || undefined);
                    createItem.fields.price.set(newProductData.price);
                }
            } else {
                triggerToast();
            }
            fetching = false;
            urlFetched = true;
        }
    };

    onMount(async () => {
        if (url.searchParams.has("productUrl")) {
            await getInfo(url.searchParams.get("productUrl"));
        }
    });

    // Hijack the back button to navigate back to the redirect
    onMount(() => {
        const callback = async (_event: PopStateEvent) => {
            if (page.url.searchParams.has("redirectTo")) {
                await goto(page.url.searchParams.get("redirectTo")!, { invalidateAll: true });
            }
        };
        addEventListener("popstate", callback, { once: true });
        return () => removeEventListener("popstate", callback);
    });

    const onCancel = () => {
        if (page.url.searchParams.has("redirectTo")) {
            goto(page.url.searchParams.get("redirectTo")!, { replaceState: true });
        } else {
            history.back();
        }
    };
</script>

<div class="grid grid-cols-7 gap-4">
    <label class="label col-span-full">
        <span>{$t("wishes.item-url")}</span>
        <div class="flex flex-row gap-x-4">
            <div class="input-group w-full grid-cols-[auto_1fr_auto]">
                <div class="ig-cell preset-tonal">
                    <iconify-icon icon="ion:link"></iconify-icon>
                </div>
                <input
                    {...createItem.fields.url.as("url")}
                    class="ig-input"
                    onfocusout={() => getInfo(createItem.fields.url.value())}
                    placeholder={$t("wishes.url-placeholder")}
                />
                {#if createItem.fields.url.value()}
                    <button
                        id="reset-field"
                        class="ig-cell"
                        aria-label={$t("a11y.clear-url-field")}
                        onclick={() => createItem.fields.url.set(undefined)}
                        onkeypress={(e) => e.preventDefault()}
                        tabindex="-1"
                        type="button"
                    >
                        <iconify-icon icon="ion:close-circle"></iconify-icon>
                    </button>
                {/if}
            </div>
            {#if createItem.fields.url.value()}
                <button
                    id="refresh-item"
                    class="preset-tonal-primary border-primary-500 btn btn-icon border"
                    aria-label={$t("a11y.refresh-item-data")}
                    onclick={(e) => {
                        e.preventDefault();
                        urlFetched = false;
                        getInfo(createItem.fields.url.value());
                    }}
                    onkeypress={(e) => e.preventDefault()}
                    tabindex="-1"
                    type="button"
                >
                    <iconify-icon icon="ion:refresh"></iconify-icon>
                </button>
            {/if}
        </div>
        {#each createItem.fields.url.issues() as issue}
            <p class="text-invalid pt-2">{issue.message}</p>
        {/each}
    </label>

    <label class="label col-span-full xl:col-span-3">
        <span>{$t("wishes.item-name")}*</span>
        <div class="input-group grid-cols-[auto_1fr]">
            <div class="ig-cell preset-tonal">
                <iconify-icon icon="ion:bag-handle"></iconify-icon>
            </div>
            <input {...createItem.fields.name.as("text")} required class="ig-input" autocomplete="off" />
        </div>
        {#each createItem.fields.name.issues() as issue}
            <p class="text-invalid pt-2">{issue.message}</p>
        {/each}
    </label>

    <label class="label col-span-full sm:col-span-4 xl:col-span-2">
        <span>{$t("wishes.price")}</span>
        <CurrencyInput
            name={createItem.fields.price.as("number").name}
            currencyName={createItem.fields.currency.as("text").name}
            currency={createItem.fields.currency.value()}
            value={createItem.fields.price.value()}
        />
    </label>

    <div class="label col-span-full sm:col-span-3 xl:col-span-2">
        <label class="pb-1" for="quantity">
            <span>{$t("wishes.quantity")}</span>
        </label>
        <div class="flex flex-row items-center gap-2">
            <div class="grow">
                <div class="input-group grid-cols-[auto_1fr]">
                    <div class="ig-cell preset-tonal">
                        <iconify-icon icon="ion:gift"></iconify-icon>
                    </div>
                    <input
                        {...createItem.fields.quantity.as("number")}
                        class="ig-input w-0 min-w-full"
                        autocomplete="off"
                        defaultValue={1}
                        disabled={unlimited}
                        inputmode="numeric"
                        max="999"
                        min="1"
                        onchange={(e) => {
                            if (!isNaN(e.currentTarget.valueAsNumber)) {
                                quantity = e.currentTarget.valueAsNumber;
                            }
                        }}
                        required={unlimited ? false : true}
                        step="1"
                        type={unlimited ? "text" : "number"}
                        value={unlimited ? $t("general.na") : quantity}
                    />
                </div>
            </div>
            <label class="checkbox-label w-fit" for="unlimited">
                <input id="unlimited" class="checkbox" type="checkbox" bind:checked={unlimited} />
                <span>{$t("wishes.no-limit")}</span>
            </label>
        </div>
        {#if form?.errors?.quantity}
            <p class="text-invalid">{form.errors.quantity[0]}</p>
        {/if}
    </div>

    <label class="label col-span-full md:col-span-3" for="image">
        <span>{$t("wishes.upload-image")}</span>
        <FileUpload name="image" class="py-1 pl-1" accept="image/*"></FileUpload>
    </label>

    <label class="label col-span-full md:col-span-4" for="imageUrl">
        <span>{$t("wishes.image-url")}</span>
        <div class="input-group grid-cols-[auto_1fr]">
            <div class="ig-cell preset-tonal">
                <iconify-icon icon="ion:image"></iconify-icon>
            </div>
            <input {...createItem.fields.imageUrl.as("text")} class="ig-input" autocomplete="off" />
        </div>
    </label>

    <div class="col-span-full">
        <label class="checkbox-label w-fit" for="mostWanted">
            <input {...createItem.fields.mostWanted.as("checkbox")} class="checkbox" />
            <span>{$t("wishes.most-wanted")}</span>
        </label>
        <span class="subtext">{$t("wishes.most-wanted-description")}</span>
    </div>

    <label class="label col-span-full" for="note">
        <span>{$t("wishes.notes")}</span>
        <MarkdownEditor id="note" name="note" placeholder={$t("wishes.note-placeholder")} value={productData.note} />
    </label>

    <ListSelector {currentList} item={productData} lists={otherLists} {userId} />

    <span class="col-span-full text-sm">*{$t("general.required-field")}</span>

    <div class="col-span-full flex w-full flex-col-reverse gap-2 sm:w-full sm:flex-row sm:justify-between">
        <button
            class="preset-tonal-secondary border-secondary-500 btn border"
            disabled={fetching || saving}
            onclick={onCancel}
            type="button"
        >
            {$t("general.cancel")}
        </button>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:gap-2">
            {#if !item.id}
                <button
                    id="submit-stay"
                    class="btn preset-outlined-primary-500"
                    disabled={fetching || saving}
                    onclick={() => (submitSrc = "submit-stay")}
                    type="submit"
                >
                    {#if saving && submitSrc == "submit-stay"}
                        <span class="loading loading-spinner loading-xs"></span>
                    {/if}
                    <span>{$t("wishes.create-and-add-another")}</span>
                </button>
            {/if}
            <button
                id="submit"
                class="preset-filled-primary-500 btn"
                disabled={fetching || saving}
                onclick={() => (submitSrc = "submit")}
                type="submit"
            >
                {#if saving && submitSrc == "submit"}
                    <span class="loading loading-spinner loading-xs"></span>
                {/if}
                <span>{buttonText}</span>
            </button>
        </div>
    </div>
</div>

{#if fetching}
    <Backdrop text={$t("wishes.hang-tight-gathering-product-data")} />
{/if}
