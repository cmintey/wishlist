<script lang="ts">
    import { getFormatter, getLocaleConfig } from "$lib/price-formatter";
    import type { KeyboardEventHandler } from "svelte/elements";
    import { onMount } from "svelte";
    import { getToastStore } from "@skeletonlabs/skeleton";

    export let value: number | null = null;
    export let locale: string = "en-US";
    export let currency: string = "USD";
    export let name: string;
    export let id: string;
    export let disabled: boolean = false;

    const toastStore = getToastStore();
    let formatter = getFormatter(currency, locale);
    let localeConfig = getLocaleConfig(formatter);
    let maximumFractionDigits = formatter.resolvedOptions().maximumFractionDigits || 2;
    let inputtedValue = value !== null ? value.toString() : "";
    let displayValue = inputtedValue;
    let inputElement: HTMLInputElement | undefined;
    let isMounted = false;
    let previousCurrency = currency;

    onMount(() => {
        isMounted = true;
    });

    // Checks if the key pressed is allowed
    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
        const isDeletion = event.key === "Backspace" || event.key === "Delete";
        const isModifier = event.metaKey || event.altKey || event.ctrlKey;
        const isArrowKey = event.key === "ArrowLeft" || event.key === "ArrowRight";
        const isTab = event.key === "Tab";
        const isInvalidCharacter = !/^\d|,|\.|-$/g.test(event.key); // Keys that are not a digit, comma, period or minus sign

        // If there is already a decimal point, don't allow more than one
        const isPunctuationDuplicated = () => {
            if (event.key !== "," && event.key !== ".") return false; // Is `false` because it's not a punctuation key
            if (localeConfig.decimalSeparator) return displayValue.split(localeConfig.decimalSeparator).length > 1;
            return false;
        };

        if (isPunctuationDuplicated() || (!isDeletion && !isModifier && !isArrowKey && isInvalidCharacter && !isTab)) {
            event.preventDefault();
            return;
        }
    };

    const handleBlur = () => {
        if (displayValue === "") {
            value = null;
            inputtedValue = "";
            displayValue = "";
            return;
        }
        let stringValue = displayValue;
        if (localeConfig.groupSeparator === ".") {
            stringValue = stringValue.replace(".", "");
        } else if (localeConfig.groupSeparator === ",") {
            stringValue = stringValue.replace(",", "");
        }
        if (localeConfig.decimalSeparator === ",") {
            stringValue = stringValue.replace(",", ".");
        }
        value = parseFloat(stringValue);
        inputtedValue = displayValue;
        displayValue = formatter.format(value);
    };

    const handleFocus = () => {
        displayValue = inputtedValue;
    };

    const validateCurrency = (
        e: Event & {
            currentTarget: EventTarget & HTMLInputElement;
        }
    ) => {
        if (!e.currentTarget.value) {
            currency = previousCurrency;
            toastStore.trigger({
                message: "Price must have a currency"
            });
            return;
        }
        try {
            Intl.NumberFormat(undefined, { style: "currency", currency: e.currentTarget.value });
            currency = e.currentTarget.value.toUpperCase();
        } catch {
            e.currentTarget.value = previousCurrency;
            toastStore.trigger({
                background: "variant-filled-warning",
                message: `Currency code is invalid. A list of valid currency codes can be found <a href="https://en.wikipedia.org/wiki/ISO_4217#Active_codes_(list_one)" target="_blank" rel="noopener noreferrer">here</a>`
            });
            return;
        }
        previousCurrency = currency;
    };

    $: formatter = getFormatter(currency, locale);
    $: {
        if (isMounted && document.activeElement !== inputElement && value !== null)
            displayValue = formatter.format(value);
    }
    $: console.log(value);
    $: console.log(displayValue);
</script>

<div class="input-group grid-cols-[auto_1fr_auto]">
    <div class="input-group-shim">
        <iconify-icon icon="ion:cash"></iconify-icon>
    </div>
    <div class="border-surface-400-500-token border-r focus:border-surface-400-500-token">
        <input {id} {name} {disabled} type="hidden" bind:value />
        <input
            bind:this={inputElement}
            id={`formatted-${id}`}
            name={`formatted-${name}`}
            class="input"
            autocomplete="off"
            {disabled}
            inputmode={maximumFractionDigits > 0 ? "decimal" : "numeric"}
            placeholder={formatter.format(0)}
            type="text"
            bind:value={displayValue}
            on:keydown={handleKeyDown}
            on:blur={handleBlur}
            on:focus={handleFocus}
        />
    </div>
    <input id="currency" name="currency" type="hidden" bind:value={currency} />
    <input
        class="border-surface-400-500-token w-[8ch] border-l uppercase focus:border-surface-400-500-token"
        maxlength="3"
        value={currency}
        on:change={validateCurrency}
    />
</div>
