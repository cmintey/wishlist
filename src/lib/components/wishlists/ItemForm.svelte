<script lang="ts">
    import { page } from "$app/state";
    import type { Group, Item, ItemPrice, List, User } from "@prisma/client";
    import Backdrop from "$lib/components/Backdrop.svelte";
    import { env } from "$env/dynamic/public";
    import { FileButton, getToastStore, Tab } from "@skeletonlabs/skeleton";
    import { getPriceValue } from "$lib/price-formatter";
    import CurrencyInput from "../CurrencyInput.svelte";
    import { onMount } from "svelte";
    import { getFormatter } from "$lib/i18n";
    import TabGroup from "../Tab/TabGroup.svelte";
    import Markdown from "../Markdown.svelte";
    import { goto } from "$app/navigation";

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
    const t = getFormatter();

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
    let previewNote = $state(false);

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

    const onCancel = () => {
        if (page.url.searchParams.has("redirectTo")) {
            goto(page.url.searchParams.get("redirectTo")!);
        } else {
            history.back();
        }
    };
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-7">
    <label class="col-span-1 md:col-span-full" for="url">
        <span>{$t("wishes.item-url")}</span>
        <div class="flex flex-row space-x-4">
            <div class="input-group grid-cols-[auto_1fr_auto]">
                <div class="input-group-shim">
                    <iconify-icon icon="ion:link"></iconify-icon>
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

    <label class="col-span-1 md:col-span-full xl:col-span-4" for="name">
        <span>{$t("wishes.item-name")}*</span>
        <div class="input-group grid-cols-[auto_1fr]">
            <div class="input-group-shim">
                <iconify-icon icon="ion:bag-handle"></iconify-icon>
            </div>
            <input
                id="name"
                name="name"
                class="input"
                class:input-error={form?.errors?.name?._errors}
                autocomplete="off"
                required
                type="text"
                bind:value={productData.name}
            />
        </div>
        {#if form?.errors?.name?._errors}
            <p class="unstyled text-error-500-400-token pt-2 text-xs">{form.errors.name._errors[0]}</p>
        {/if}
    </label>

    <label class="col-span-1 md:col-span-5 xl:col-span-2" for="price">
        <span>{$t("wishes.price")}</span>
        <CurrencyInput id="price" name="price" currency={userCurrency} bind:value={price} />
    </label>

    <label class="col-span-1 md:col-span-2 xl:col-span-1" for="quantity">
        <span>{$t("wishes.quantity")}</span>
        <div class="input-group grid-cols-[auto_1fr]">
            <div class="input-group-shim">
                <iconify-icon icon="ion:gift"></iconify-icon>
            </div>
            <input
                id="quantity"
                name="quantity"
                class="input"
                autocomplete="off"
                defaultValue="1"
                max="999"
                min="1"
                placeholder="1"
                step="1"
                type="number"
                bind:value={item.quantity}
            />
        </div>
    </label>

    <label class="col-span-1 md:col-span-3" for="image">
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

    <label class="col-span-1 md:col-span-4" for="imageUrl">
        <span>{$t("wishes.image-url")}</span>
        <div class="input-group grid-cols-[auto_1fr]">
            <div class="input-group-shim">
                <iconify-icon icon="ion:image"></iconify-icon>
            </div>
            <input
                id="imageUrl"
                name="imageUrl"
                class="input"
                autocomplete="off"
                type="text"
                bind:value={productData.imageUrl}
            />
        </div>
    </label>

    <label class="col-span-full" for="note">
        <span>{$t("wishes.notes")}</span>
        <div class="card p-2">
            <TabGroup border="border-none">
                <Tab name={$t("wishes.write")} value={false} bind:group={previewNote}>{$t("wishes.write")}</Tab>
                <Tab name={$t("wishes.preview")} value={true} bind:group={previewNote}>{$t("wishes.preview")}</Tab>
            </TabGroup>
            <textarea
                id="note"
                name="note"
                class="textarea"
                class:hidden={previewNote}
                placeholder={$t("wishes.note-placeholder")}
                rows="4"
                bind:value={productData.note}
            ></textarea>
            {#if previewNote}
                {#if productData.note}
                    <div
                        class="variant-ringed-surface h-28 max-w-none overflow-scroll whitespace-pre-wrap px-3 py-2 rounded-container-token"
                    >
                        <Markdown source={productData.note} />
                    </div>
                {/if}
            {/if}
            <a class="variant-soft btn btn-sm mt-1" href="https://www.markdownguide.org/basic-syntax/" target="_blank">
                <iconify-icon icon="ion:logo-markdown"></iconify-icon>
                <span>{$t("wishes.supports-markdown")}</span>
            </a>
        </div>
    </label>

    <fieldset class="col-span-1 flex flex-col space-y-2 md:col-span-5" class:hidden={lists.length <= 1}>
        <legend>{$t("wishes.lists")}</legend>
        <div
            class="border-surface-400-500-token flex h-36 flex-col space-y-2 overflow-scroll p-2 border-token rounded-container-token"
            class:input-error={form?.errors?.lists?._errors}
        >
            {#each lists as list (list.id)}
                <label class="flex items-center space-x-2" for={list.id}>
                    <input
                        id={list.id}
                        name="lists"
                        class="checkbox"
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
        {#if form?.errors?.lists?._errors}
            <p class="unstyled text-error-500-400-token text-xs">{form.errors.lists._errors[0]}</p>
        {/if}
    </fieldset>

    <span class="col-span-full text-sm">*{$t("general.required-field")}</span>

    <div class="col-span-full flex w-full flex-col-reverse gap-4 sm:w-full sm:flex-row sm:justify-between">
        <button class="variant-ghost-secondary btn" onclick={onCancel} type="button">
            {$t("general.cancel")}
        </button>
        <div class="flex flex-col-reverse gap-4 sm:flex-row sm:gap-2">
            {#if !item.id}
                <button id="submit-stay" class="variant-outline-primary btn" disabled={loading} type="submit">
                    {$t("wishes.create-and-add-another")}
                </button>
            {/if}
            <button id="submit" class="variant-filled-primary btn" disabled={loading} type="submit">
                {buttonText}
            </button>
        </div>
    </div>
</div>

{#if loading}
    <Backdrop text={$t("wishes.hang-tight-gathering-product-data")} />
{/if}
