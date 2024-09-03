<!-- Original Source: https://github.com/fmaclen/svelte-currency-input -->
<script lang="ts">
    import { getFormatter } from "$lib/price-formatter";
    import { onMount } from "svelte";

    const DEFAULT_LOCALE = "en-US";
    const DEFAULT_CURRENCY = "USD";
    const DEFAULT_VALUE = 0;
    const DEFAULT_FRACTION_DIGITS = 2;

    type Callback = (value: number) => any;

    export let value: number = DEFAULT_VALUE;
    export let locale: string = DEFAULT_LOCALE;
    export let currency: string = DEFAULT_CURRENCY;
    export let name: string;
    export let id: string;
    export let required: boolean = false;
    export let disabled: boolean = false;
    export let placeholder: string | number | null = DEFAULT_VALUE;
    export let autocomplete: string | null | undefined = undefined;
    export let isNegativeAllowed: boolean = true;
    export let isZeroNullish: boolean = false;
    export let fractionDigits: number = DEFAULT_FRACTION_DIGITS;
    export let onValueChange: Callback = () => {};

    // Formats value as: e.g. $1,523.00 | -$1,523.00
    const formatCurrency = (value: number, maximumFractionDigits?: number, minimumFractionDigits?: number) => {
        return new Intl.NumberFormat(locale, {
            currency: currency,
            style: "currency",
            currencyDisplay: "narrowSymbol",
            maximumFractionDigits: maximumFractionDigits || 0,
            minimumFractionDigits: minimumFractionDigits || 0
        }).format(value);
    };

    // Checks if the key pressed is allowed
    const handleKeyDown = (event: KeyboardEvent) => {
        const isDeletion = event.key === "Backspace" || event.key === "Delete";
        const isModifier = event.metaKey || event.altKey || event.ctrlKey;
        const isArrowKey = event.key === "ArrowLeft" || event.key === "ArrowRight";
        const isTab = event.key === "Tab";
        const isInvalidCharacter = !/^\d|,|\.|-$/g.test(event.key); // Keys that are not a digit, comma, period or minus sign

        // If there is already a decimal point, don't allow more than one
        const isPunctuationDuplicated = () => {
            if (event.key !== "," && event.key !== ".") return false; // Is `false` because it's not a punctuation key
            if (isDecimalComma) return formattedValue.split(",").length >= 2;
            if (!isDecimalComma) return formattedValue.split(".").length >= 2;
            return false;
        };

        if (isPunctuationDuplicated() || (!isDeletion && !isModifier && !isArrowKey && isInvalidCharacter && !isTab)) {
            event.preventDefault();
            return;
        }
    };

    // Formats the value when the input loses focus and sets the correct number of
    // fraction digits when the value is zero
    const handleOnBlur = () => setFormattedValue();

    let dom: Document;
    let inputElement: HTMLInputElement;

    onMount(() => {
        // Set the document object as a variable so we know the page has mounted
        dom = document;

        // Set the correct fraction digits when the value is zero on initial load
        setFormattedValue();
    });

    const currencyFormatter = getFormatter(currency, locale);
    const options = currencyFormatter.resolvedOptions();
    const parts = currencyFormatter.formatToParts(1.1);
    const currencyDecimal = parts.find((part) => part.type === "decimal")?.value || "."; // '.' or ','
    const isDecimalComma = currencyDecimal === ",";
    const currencySymbol = parts.find((part) => part.type === "currency")?.value;

    // Updates `value` by stripping away the currency formatting
    const setUnformattedValue = (event?: KeyboardEvent) => {
        if (event) {
            // Don't format if the user is typing a `currencyDecimal` point
            if (event.key === currencyDecimal) return;

            // Don't format if `formattedValue` is ['$', '-$', "-"]
            const ignoreSymbols = [currencySymbol, `-${currencySymbol}`, "-"];
            const strippedUnformattedValue = formattedValue.replace(" ", "");
            if (ignoreSymbols.includes(strippedUnformattedValue)) return;

            // Reverse the value when minus is pressed
            if (isNegativeAllowed && event.key === "-") value = value * -1;
        }

        // Remove all characters that arent: numbers, commas, periods (or minus signs if `isNegativeAllowed`)
        let unformattedValue = isNegativeAllowed
            ? formattedValue.replace(/[^0-9,.-]/g, "")
            : formattedValue.replace(/[^0-9,.]/g, "");

        // Finally set the value
        if (Number.isNaN(parseFloat(unformattedValue))) {
            value = 0;
        } else {
            // The order of the following operations is *critical*
            unformattedValue = unformattedValue.replace(isDecimalComma ? /\./g : /,/g, ""); // Remove all group symbols
            if (isDecimalComma) unformattedValue = unformattedValue.replace(",", "."); // If the decimal point is a comma, replace it with a period

            // If the zero-key has been pressed
            // and if the current `value` is the same as the `value` before the key-press
            // formatting may need to be done (Issue #30)
            const previousValue = value;
            value = parseFloat(unformattedValue);

            if (event && previousValue === value) {
                // Do the formatting if the number of digits after the decimal point exceeds `fractionDigits`
                if (unformattedValue.includes(".") && unformattedValue.split(".")[1].length > fractionDigits) {
                    setFormattedValue();
                }
            }
        }
    };

    const setFormattedValue = () => {
        // Do nothing because the page hasn't mounted yet
        if (!dom) return;

        // Previous caret position
        const startCaretPosition = inputElement?.selectionStart || 0;
        const previousFormattedValueLength = formattedValue.length;

        // Apply formatting to input
        formattedValue =
            isZero && !isZeroNullish
                ? ""
                : formatCurrency(value, fractionDigits, dom.activeElement === inputElement ? 0 : fractionDigits);

        // Update `value` after formatting
        setUnformattedValue();

        let retries = 0;
        while (previousFormattedValueLength === formattedValue.length && retries < 10) retries++;

        if (previousFormattedValueLength !== formattedValue.length) {
            const endCaretPosition = startCaretPosition + formattedValue.length - previousFormattedValueLength;
            inputElement?.setSelectionRange(endCaretPosition, endCaretPosition);
        }

        // Run callback function when `value` changes
        onValueChange(value);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handlePlaceholder = (placeholder: string | number | null, currency: string) => {
        if (typeof placeholder === "number") return formatCurrency(placeholder, fractionDigits, fractionDigits);
        if (placeholder === null) return "";
        return placeholder;
    };

    let formattedValue = "";
    $: isNegative = value < 0;
    $: isPositive = value > 0;
    $: isZero = !isNegative && !isPositive;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    $: value, currency, setFormattedValue();
</script>

<div class="border-surface-400-500-token border-r focus:border-surface-400-500-token">
    <input {id} {name} {disabled} type="hidden" bind:value />
    <input
        bind:this={inputElement}
        id={`formatted-${id}`}
        name={`formatted-${name}`}
        class="input"
        {autocomplete}
        {disabled}
        inputmode={options.maximumFractionDigits || DEFAULT_FRACTION_DIGITS > 0 ? "decimal" : "numeric"}
        placeholder={handlePlaceholder(placeholder, currency)}
        required={required && !isZero}
        type="text"
        bind:value={formattedValue}
        on:keydown={handleKeyDown}
        on:keyup={setUnformattedValue}
        on:blur={handleOnBlur}
    />
</div>
