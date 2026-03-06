<script lang="ts">
    import { getFormatter as getPriceFormatter, getLocaleConfig } from "$lib/price-formatter";
    import type { KeyboardEventHandler } from "svelte/elements";
    import { onMount } from "svelte";
    import { getFormatter, getLocale } from "$lib/i18n";
    import { toaster } from "./toaster";
    import { getNumberFormatter } from "svelte-i18n";

    interface Props {
        value?: number | null;
        currency?: string;
        name: string;
        id: string;
        disabled?: boolean;
    }

    let { value = $bindable(null), currency = $bindable("USD"), name, id, disabled = false }: Props = $props();
    const t = getFormatter();
    const locale = getLocale();

    let numberFormatter = getNumberFormatter({ locale });
    let priceFormatter = $derived(getPriceFormatter(currency));
    let localeConfig = $derived(getLocaleConfig(priceFormatter));
    let maximumFractionDigits = $derived(priceFormatter.resolvedOptions().maximumFractionDigits || 2);
    let inputtedValue = $state(value !== null ? numberFormatter.format(value) : "");
    // svelte-ignore state_referenced_locally
    let displayValue = $state(inputtedValue);
    let inputElement: HTMLInputElement | undefined = $state();
    let isMounted = $state(false);
    let previousCurrency = currency;

    onMount(() => {
        isMounted = true;
    });

    $effect(() => {
        if (isMounted && document.activeElement !== inputElement && value !== null)
            displayValue = priceFormatter.format(value);
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
        displayValue = priceFormatter.format(value);
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
            toaster.info({
                description: $t("errors.price-must-have-a-currency")
            });
            return;
        }
        try {
            Intl.NumberFormat(undefined, { style: "currency", currency: e.currentTarget.value });
            currency = e.currentTarget.value.toUpperCase();
        } catch {
            e.currentTarget.value = previousCurrency;
            toaster.warning({
                description: $t("errors.invalid-currency-code")
            });
            return;
        }
        previousCurrency = currency;
    };
</script>

<div class="input-group grid-cols-[auto_1fr_auto]">
    <div class="ig-cell preset-tonal">
        <iconify-icon icon="ion:pricetag"></iconify-icon>
    </div>
    <input
        bind:this={inputElement}
        id={`formatted-${id}`}
        name={`formatted-${name}`}
        class="ig-input"
        autocomplete="off"
        {disabled}
        inputmode={maximumFractionDigits > 0 ? "decimal" : "numeric"}
        onblur={handleBlur}
        onfocus={handleFocus}
        onkeydown={handleKeyDown}
        placeholder={priceFormatter.format(0)}
        type="text"
        bind:value={displayValue}
    />
    <input
        class="ig-input w-[8ch] uppercase"
        data-testid="currency"
        maxlength="3"
        onchange={validateCurrency}
        type="text"
        value={currency}
    />
</div>

<input {id} {name} {disabled} type="hidden" bind:value />
<input id="currency" name="currency" type="hidden" bind:value={currency} />
