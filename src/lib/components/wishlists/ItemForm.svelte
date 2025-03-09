<script lang="ts">
    import { page } from "$app/state";
    import type { Group, Item, ItemPrice, List, User } from "@prisma/client";
    import Backdrop from "$lib/components/Backdrop.svelte";
    import { env } from "$env/dynamic/public";
    import { FileButton, getToastStore } from "@skeletonlabs/skeleton";
    import { getPriceValue } from "$lib/price-formatter";
    import CurrencyInput from "../CurrencyInput.svelte";
    import { t } from "svelte-i18n";
    import { onMount } from "svelte";

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
    }

    let { item = $bindable(), buttonText, lists: otherLists = [], currentList }: Props = $props();

    let productData = $state(item);
    let form = $derived(page.form);
    let url = $derived(page.url);
    let loading = $state(false);
    let urlFetched = $state(false);
    const toastStore = getToastStore();
    let price: number | null = $state(getPriceValue(productData));
    const defaultCurrency = env.PUBLIC_DEFAULT_CURRENCY || "USD";
    let userCurrency: string = $derived(productData.itemPrice?.currency || defaultCurrency);
    let files: FileList | undefined = $state();
    let uploadedImageName: string | undefined = $derived(files?.item(0)?.name || $t("general.no-file-selected"));

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
            return matches[0];
        }
        return null;
    };

    const triggerToast = () => {
        toastStore.trigger({
            message: $t("errors.unable-to-find-product-information"),
            background: "variant-filled-warning",
            autohide: true,
            timeout: 5000
        });
    };

    const getInfo = async () => {
        if (productData.url && !urlFetched) {
            loading = true;
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
                                console.log(newProductData.url);
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
            loading = false;
            urlFetched = true;
        }
    };

    onMount(async () => {
        if (url.searchParams.has("productUrl")) {
            productData.url = url.searchParams.get("productUrl");
            await getInfo();
        }
    });
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-6">
    <label class="col-span-1 md:col-span-6" for="url">
        <span>{$t("wishes.item-url")}</span>
        <div class="flex flex-row space-x-4">
            <div class="input-group grid-cols-[auto_1fr_auto]">
                <div class="input-group-shim">
                    <iconify-icon icon="ion:bag-handle"></iconify-icon>
                </div>
                <input
                    id="url"
                    name="url"
                    class="input"
                    onfocusout={() => getInfo()}
                    placeholder={$t("wishes.url-placeholder")}
                    type="url"
                    bind:value={productData.url}
                />
                {#if productData.url}
                    <button
                        id="reset-field"
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
                    class="variant-ghost-primary btn btn-icon"
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

    <label class="col-span-1 row-start-2 md:col-span-4" for="name">
        <span>{$t("wishes.item-name")}*</span>
        <div class="input-group grid-cols-[auto_1fr]">
            <div class="input-group-shim">
                <iconify-icon icon="ion:gift"></iconify-icon>
            </div>
            <input
                id="name"
                name="name"
                class="input"
                class:input-error={form?.errors?.["name"]}
                autocomplete="off"
                required
                type="text"
                bind:value={productData.name}
            />
        </div>
        {#if form?.errors?.["name"]}
            <p class="unstyled text-error-500-400-token pt-2 text-xs">{form?.errors?.["name"]}</p>
        {/if}
    </label>

    <label class="col-span-1 row-start-3 md:col-span-2 md:row-start-2" for="price">
        <span>{$t("wishes.price")}</span>
        <CurrencyInput id="price" name="price" currency={userCurrency} bind:value={price} />
    </label>

    <label class="col-span-1 md:col-span-2" for="image">
        <span>{$t("wishes.upload-image")}</span>
        <div
            class="bg-surface-200-700-token border-surface-400-500-token grid grid-cols-[auto_1fr] items-center gap-2 border-token rounded-token"
        >
            <FileButton
                id="image"
                name="image"
                class="py-1 pl-1"
                accept="image/*"
                button="btn btn-sm variant-filled"
                bind:files
            >
                {$t("general.select-file")}
            </FileButton>
            <span>{uploadedImageName}</span>
        </div>
    </label>

    <label class="col-span-1 md:col-span-4" for="image_url">
        <span>{$t("wishes.image-url")}</span>
        <div class="input-group grid-cols-[auto_1fr]">
            <div class="input-group-shim">
                <iconify-icon icon="ion:image"></iconify-icon>
            </div>
            <input
                id="image_url"
                name="image_url"
                class="input"
                autocomplete="off"
                type="text"
                bind:value={productData.imageUrl}
            />
        </div>
    </label>

    <label class="col-span-1 md:col-span-6" for="note">
        <span>{$t("wishes.notes")}</span>
        <textarea
            id="note"
            name="note"
            class="textarea"
            placeholder={$t("wishes.note-placeholder")}
            rows="4"
            bind:value={productData.note}
        ></textarea>
    </label>

    <fieldset class="col-span-1 flex flex-col space-y-2 md:col-span-6" class:hidden={lists.length <= 1}>
        <legend>Lists</legend>
        <div
            class="border-surface-400-500-token flex h-36 flex-col space-y-2 overflow-scroll p-2 border-token rounded-container-token"
            class:input-error={form?.errors?.["list"]}
        >
            {#each lists as list (list.id)}
                <label class="flex items-center space-x-2" for={list.id}>
                    <input
                        id={list.id}
                        name="list"
                        class="checkbox disabled:checked:bg-surface-400-500-token disabled:cursor-not-allowed"
                        checked={listsHavingItem[list.id] !== undefined}
                        disabled={listsHavingItem[list.id] === false}
                        type="checkbox"
                        value={list.id}
                    />
                    <div class="!mt-0 flex flex-row space-x-2">
                        <span>
                            {list.name}
                        </span>
                        <span class="font-bold italic">({list.group.name})</span>
                    </div>
                </label>
            {/each}
        </div>
        {#if form?.errors?.["list"]}
            <p class="unstyled text-error-500-400-token text-xs">{form?.errors?.["list"]}</p>
        {/if}
    </fieldset>

    <span class="col-span-full text-sm">*{$t("general.required-field")}</span>

    <div class="col-span-full flex flex-row justify-between">
        <button class="variant-ghost-secondary btn w-min" onclick={() => history.back()} type="button">
            {$t("general.cancel")}
        </button>
        <button class="variant-filled-primary btn w-min" disabled={loading} type="submit">
            {buttonText}
        </button>
    </div>
</div>

{#if loading}
    <Backdrop text={$t("wishes.hang-tight-gathering-product-data")} />
{/if}
