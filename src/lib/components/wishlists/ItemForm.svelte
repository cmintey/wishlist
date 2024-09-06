<script lang="ts">
    import { page } from "$app/stores";
    import type { Item, ItemPrice } from "@prisma/client";
    import Backdrop from "$lib/components/Backdrop.svelte";
    import { env } from "$env/dynamic/public";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { onMount } from "svelte";
    import { getPriceValue } from "$lib/price-formatter";
    import CurrencyInput from "../CurrencyInput.svelte";

    export let data: Partial<Item> & {
        itemPrice?: ItemPrice | null;
    };
    export let buttonText: string;

    $: form = $page.form;
    let loading = false;
    let urlFetched = false;
    const toastStore = getToastStore();
    let locale: string | undefined;
    let price: number = getPriceValue(data);
    const defaultCurrency = env.PUBLIC_DEFAULT_CURRENCY || "USD";
    let userCurrency: string = data.itemPrice?.currency || defaultCurrency;
    let previousCurrency = userCurrency;

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
        if (data.url && !urlFetched) {
            loading = true;
            const url = extractUrl(data.url);
            const res = await fetch(`/api/product?url=${url}`);
            if (res.ok) {
                let productData: ProductData = await res.json();
                data.url = productData.url ? productData.url : url;
                data.name = productData.name ? productData.name : productData.title || "";
                data.imageUrl = productData.image;
                if (productData.price) {
                    data.itemPrice = {
                        id: "temp-id",
                        currency: productData.currency || defaultCurrency,
                        value: productData.price
                    };
                    price = data.itemPrice.value;
                    userCurrency = data.itemPrice.currency;
                    previousCurrency = userCurrency;
                }
            } else {
                triggerToast();
            }
            loading = false;
            urlFetched = true;
        }
    };

    const validateCurrency = (currency: string | undefined) => {
        if (!currency) {
            userCurrency = previousCurrency;
            toastStore.trigger({
                message: "Price must have a currency"
            });
            return;
        }
        try {
            Intl.NumberFormat(undefined, { style: "currency", currency });
        } catch {
            userCurrency = previousCurrency;
            toastStore.trigger({
                background: "variant-filled-warning",
                message: `Currency code is invalid. A list of valid currency codes can be found <a href="https://en.wikipedia.org/wiki/ISO_4217#Active_codes_(list_one)" target="_blank" rel="noopener noreferrer">here</a>`
            });
            return;
        }
        previousCurrency = userCurrency;
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
                    placeholder="Enter a URL to fetch the item data"
                    type="url"
                    bind:value={data.url}
                    on:focusout={() => getInfo()}
                />
                {#if data.url}
                    <button
                        id="reset-field"
                        tabindex="-1"
                        type="button"
                        on:click={() => (data.url = null)}
                        on:keypress|preventDefault
                    >
                        <iconify-icon icon="ion:close-circle" />
                    </button>
                {/if}
            </div>
            {#if data.url}
                <button
                    id="refresh-item"
                    class="variant-ghost-primary btn btn-icon"
                    tabindex="-1"
                    type="button"
                    on:click|preventDefault={() => {
                        urlFetched = false;
                        getInfo();
                    }}
                    on:keypress|preventDefault
                >
                    <iconify-icon icon="ion:refresh" />
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
                bind:value={data.name}
            />
        </div>
        {#if form?.missing}
            <p class="unstyled pt-2 text-xs text-warning-500">Item name required</p>
        {/if}
    </label>

    <label class="col-span-1 row-start-3 md:col-span-2 md:row-start-2" for="price">
        <span>Price</span>
        <div class="input-group grid-cols-[auto_1fr_auto]">
            <div class="input-group-shim">
                <iconify-icon icon="ion:cash"></iconify-icon>
            </div>
            <CurrencyInput id="price" name="price" currency={previousCurrency} {locale} bind:value={price} />
            <input id="currency" name="currency" type="hidden" bind:value={userCurrency} />
            <input
                class="border-surface-400-500-token w-[8ch] border-l focus:border-surface-400-500-token"
                maxlength="3"
                on:change={(e) => validateCurrency(e.currentTarget.value)}
                bind:value={userCurrency}
            />
        </div>
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
                bind:value={data.imageUrl}
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
            bind:value={data.note}
        />
    </label>

    <div class="flex flex-col space-y-2">
        <span class="text-sm">*required field</span>

        <div class="flex flex-row space-x-4">
            <button class="variant-filled-primary btn w-min" disabled={loading} type="submit">
                {buttonText}
            </button>
            <button class="variant-ghost-secondary btn w-min" type="button" on:click={() => history.back()}>
                Cancel
            </button>
        </div>
    </div>
</div>

{#if loading}
    <Backdrop text="Hang tight, gathering product data" />
{/if}
