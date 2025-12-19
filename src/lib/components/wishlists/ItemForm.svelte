<script lang="ts">
    import { page } from "$app/state";
    import type { Group, Item, ItemPrice, List, User } from "$lib/generated/prisma/client";
    import Backdrop from "$lib/components/Backdrop.svelte";
    import { getDefaultCurrency, getPriceValue } from "$lib/price-formatter";
    import CurrencyInput from "../CurrencyInput.svelte";
    import { onMount } from "svelte";
    import { getFormatter } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import MarkdownEditor from "../MarkdownEditor.svelte";
    import FileUpload from "../FileUpload.svelte";
    import { toaster } from "../toaster";

    interface ListProps extends Pick<List, "id" | "name" | "public"> {
        owner: Pick<User, "name">;
        group: Pick<Group, "name">;
    }

    interface ExistingListProps extends Pick<List, "id"> {
        canModify: boolean;
    }

    interface Props {
        item: Partial<Item> & {
            itemPrice?: ItemPrice | null;
            lists?: ExistingListProps[];
        };
        lists?: ListProps[];
        currentList?: string;
        buttonText: string;
        saving: boolean;
    }

    let { item = $bindable(), buttonText, lists: otherLists = [], currentList, saving = false }: Props = $props();
    const t = getFormatter();

    let productData = $state(item);
    let form = $derived(page.form);
    let url = $derived(page.url);
    let fetching = $state(false);
    let urlFetched = $state(false);
    let price: number | null = $state(getPriceValue(productData));
    const defaultCurrency = getDefaultCurrency();
    let userCurrency: string = $derived(productData.itemPrice?.currency || defaultCurrency);
    let quantity = $state(item.quantity || 1);
    let unlimited = $state(item.quantity === null);
    let submitSrc = $state("submit");

    const listsHavingItem = $derived.by(() => {
        return productData.lists
            ? productData.lists.reduce(
                  (accum, list) => {
                      accum[list.id] = list.canModify;
                      return accum;
                  },
                  {} as Record<string, boolean>
              )
            : { [currentList || ""]: true };
    });
    const lists = $derived(
        otherLists
            .map((l) => ({
                ...l,
                name: l.name || $t("wishes.wishes-for", { values: { listOwner: l.owner.name } })
            }))
            .toSorted((a, b) =>
                listsHavingItem[a.id] !== undefined
                    ? -Infinity
                    : listsHavingItem[b.id] !== undefined
                      ? Infinity
                      : a.name?.localeCompare(b.name)
            )
    );

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

    const getInfo = async () => {
        if (productData.url && !urlFetched) {
            fetching = true;
            const url = extractUrl(productData.url);
            const res = await fetch(`/api/product?url=${url}`);
            if (res.ok) {
                let newProductData: ProductData = await res.json();
                productData.url = newProductData.url ? newProductData.url : url;
                productData.name = newProductData.name ? newProductData.name : newProductData.title || "";
                if (newProductData.image) {
                    try {
                        const imageUrl = new URL(newProductData.image);
                        productData.imageUrl = imageUrl.href;
                    } catch {
                        if (newProductData.url) {
                            try {
                                const url = new URL(newProductData.url);
                                const imageUrl = new URL(newProductData.image, url);
                                productData.imageUrl = imageUrl.href;
                            } catch {
                                // invalid image, stop strying to make it work
                            }
                        }
                    }
                }

                if (newProductData.price) {
                    productData.itemPrice = {
                        id: "temp-id",
                        currency: newProductData.currency || defaultCurrency,
                        value: newProductData.price
                    };
                    price = newProductData.price;
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
            productData.url = url.searchParams.get("productUrl");
            await getInfo();
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

    const selectAll = () => {
        document.getElementsByName("lists").forEach((el) => ((el as HTMLInputElement).checked = true));
    };
</script>

<div class="grid grid-cols-7 gap-4">
    <label class="label col-span-full" for="url">
        <span>{$t("wishes.item-url")}</span>
        <div class="flex flex-row gap-x-4">
            <div class="input-group w-full grid-cols-[auto_1fr_auto]">
                <div class="ig-cell preset-tonal">
                    <iconify-icon icon="ion:link"></iconify-icon>
                </div>
                <input
                    id="url"
                    name="url"
                    class="ig-input"
                    onfocusout={() => getInfo()}
                    placeholder={$t("wishes.url-placeholder")}
                    type="url"
                    bind:value={productData.url}
                />
                {#if productData.url}
                    <button
                        id="reset-field"
                        class="ig-cell"
                        aria-label={$t("a11y.clear-url-field")}
                        onclick={() => (productData.url = null)}
                        onkeypress={(e) => e.preventDefault()}
                        tabindex="-1"
                        type="button"
                    >
                        <iconify-icon icon="ion:close-circle"></iconify-icon>
                    </button>
                {/if}
            </div>
            {#if productData.url}
                <button
                    id="refresh-item"
                    class="preset-tonal-primary border-primary-500 btn btn-icon border"
                    aria-label={$t("a11y.refresh-item-data")}
                    onclick={(e) => {
                        e.preventDefault();
                        urlFetched = false;
                        getInfo();
                    }}
                    onkeypress={(e) => e.preventDefault()}
                    tabindex="-1"
                    type="button"
                >
                    <iconify-icon icon="ion:refresh"></iconify-icon>
                </button>
            {/if}
        </div>
    </label>

    <label class="label col-span-full xl:col-span-3" for="name">
        <span>{$t("wishes.item-name")}*</span>
        <div class="input-group grid-cols-[auto_1fr]">
            <div class="ig-cell preset-tonal">
                <iconify-icon icon="ion:bag-handle"></iconify-icon>
            </div>
            <input
                id="name"
                name="name"
                class="ig-input"
                class:input-error={form?.errors?.name}
                autocomplete="off"
                required
                type="text"
                bind:value={productData.name}
            />
        </div>
        {#if form?.errors?.name}
            <p class="unstyled text-error-600-400 pt-2 text-xs">{form.errors.name[0]}</p>
        {/if}
    </label>

    <label class="label col-span-full sm:col-span-4 xl:col-span-2" for="price">
        <span>{$t("wishes.price")}</span>
        <CurrencyInput id="price" name="price" currency={userCurrency} bind:value={price} />
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
                        id="quantity"
                        name="quantity"
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
            <p class="unstyled text-error-600-400 text-xs">{form.errors.quantity[0]}</p>
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
            <input
                id="imageUrl"
                name="imageUrl"
                class="ig-input"
                autocomplete="off"
                type="text"
                bind:value={productData.imageUrl}
            />
        </div>
    </label>

    <div class="col-span-full">
        <label class="checkbox-label w-fit" for="mostWanted">
            <input id="mostWanted" name="mostWanted" class="checkbox" checked={item.mostWanted} type="checkbox" />
            <span>{$t("wishes.most-wanted")}</span>
        </label>
        <span class="subtext">{$t("wishes.most-wanted-description")}</span>
    </div>

    <label class="label col-span-full" for="note">
        <span>{$t("wishes.notes")}</span>
        <MarkdownEditor id="note" name="note" placeholder={$t("wishes.note-placeholder")} value={productData.note} />
    </label>

    <fieldset
        class="col-span-full flex flex-col space-y-2 md:col-span-5"
        class:hidden={lists.length <= 1}
        aria-labelledby="lists-label"
    >
        <div class="flex items-end justify-between">
            <legend id="lists-label">{$t("wishes.lists")}</legend>
            <button class="preset-tonal-primary border-primary-500 btn btn-sm border" onclick={selectAll} type="button">
                {$t("general.select-all")}
            </button>
        </div>

        <div
            class="border-surface-500 rounded-container flex h-36 flex-col space-y-2 overflow-auto border p-2"
            class:input-error={form?.errors?.lists}
        >
            {#each lists as list (list.id)}
                <label class="flex items-center gap-x-2" for={list.id}>
                    <input
                        id={list.id}
                        name="lists"
                        class="checkbox"
                        checked={listsHavingItem[list.id] !== undefined}
                        disabled={listsHavingItem[list.id] === false}
                        type="checkbox"
                        value={list.id}
                    />
                    <div class="mt-0! flex flex-row gap-x-2">
                        <span>
                            {list.name}
                        </span>
                        <span class="font-bold italic">({list.group.name})</span>
                    </div>
                </label>
            {/each}
        </div>
        {#if form?.errors?.lists}
            <p class="unstyled text-error-600-400 text-xs">{form.errors.lists[0]}</p>
        {/if}
    </fieldset>

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
