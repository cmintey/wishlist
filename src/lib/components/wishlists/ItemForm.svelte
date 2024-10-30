<script lang="ts">
    import { page } from "$app/stores";
    import type { Item, ItemPrice } from "@prisma/client";
    import Backdrop from "$lib/components/Backdrop.svelte";
    import { env } from "$env/dynamic/public";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { onMount } from "svelte";
    import { getPriceValue } from "$lib/price-formatter";
    import CurrencyInput from "../CurrencyInput.svelte";

    interface Props {
        data: Partial<Item> & {
            itemPrice?: ItemPrice | null;
        };
        buttonText: string;
    }

    let { data = $bindable(), buttonText }: Props = $props();

    let productData = $state(data);
    let form = $derived($page.form);
    let loading = $state(false);
    let urlFetched = $state(false);
    const toastStore = getToastStore();
    let locale: string | undefined = $state();
    let price: number | null = $state(getPriceValue(productData));
    const defaultCurrency = env.PUBLIC_DEFAULT_CURRENCY || "USD";
    let userCurrency: string = $derived(productData.itemPrice?.currency || defaultCurrency);

    onMount(() => {
        if (navigator.languages?.length > 0) {
            locale = navigator.languages[0];
        } else {
            locale = navigator.language;
        }
    });

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
            message: `Unable to find product information. You can still fill in the details manually.`,
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
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-6">
    <label class="col-span-1 md:col-span-6" for="url">
        <span>Item URL</span>
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
                    placeholder="Enter a URL to fetch the item data"
                    type="url"
                    bind:value={productData.url}
                />
                {#if productData.url}
                    <button
                        id="reset-field"
                        aria-label="clear url field"
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
                    aria-label="refresh item data"
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
        <span>Item Name*</span>
        <div class="input-group grid-cols-[auto_1fr]">
            <div class="input-group-shim">
                <iconify-icon icon="ion:gift"></iconify-icon>
            </div>
            <input
                id="name"
                name="name"
                class="input"
                class:input-invalid={form?.missing}
                autocomplete="off"
                required
                type="text"
                bind:value={productData.name}
            />
        </div>
        {#if form?.missing}
            <p class="unstyled pt-2 text-xs text-warning-500">Item name required</p>
        {/if}
    </label>

    <label class="col-span-1 row-start-3 md:col-span-2 md:row-start-2" for="price">
        <span>Price</span>
        <CurrencyInput id="price" name="price" currency={userCurrency} {locale} bind:value={price} />
    </label>

    <label class="col-span-1 md:col-span-2" for="image">
        <span>Upload Image</span>
        <input id="image" name="image" class="input" accept="image/*" type="file" />
    </label>

    <label class="col-span-1 md:col-span-4" for="image_url">
        <span>Image URL</span>
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
        <span>Notes</span>
        <textarea
            id="note"
            name="note"
            class="textarea"
            placeholder="i.e. size, color, etc."
            rows="4"
            bind:value={productData.note}
        ></textarea>
    </label>

    <div class="flex flex-col space-y-2">
        <span class="text-sm">*required field</span>

        <div class="flex flex-row space-x-4">
            <button class="variant-filled-primary btn w-min" disabled={loading} type="submit">
                {buttonText}
            </button>
            <button class="variant-ghost-secondary btn w-min" onclick={() => history.back()} type="button">
                Cancel
            </button>
        </div>
    </div>
</div>

{#if loading}
    <Backdrop text="Hang tight, gathering product data" />
{/if}
