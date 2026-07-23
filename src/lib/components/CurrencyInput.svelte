<script lang="ts">
    import { getFormatter as getPriceFormatter, getLocaleConfig } from "$lib/price-formatter";
    import type { KeyboardEventHandler } from "svelte/elements";
    import { onMount } from "svelte";
    import { getLocale } from "$lib/i18n";
    import { getNumberFormatter } from "svelte-i18n";
    import { Combobox, Portal, useListCollection, type ComboboxRootProps } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        value?: number | null;
        currency?: string;
        name: string;
        id: string;
        disabled?: boolean;
    }

    let { value = $bindable(null), currency = $bindable("USD"), name, id, disabled = false }: Props = $props();
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

    const availableCurrencies = Intl.supportedValuesOf("currency");

    let items = $state(availableCurrencies);
    const currenciesCollection = $derived(
        useListCollection({
            items
        })
    );

    const onInputValueChange: ComboboxRootProps["onInputValueChange"] = (event) => {
        const filtered = availableCurrencies.filter((item) => item.includes(event.inputValue.toLocaleUpperCase()));
        items = filtered;
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
    <Combobox
        class="w-22"
        alwaysSubmitOnEnter={false}
        collection={currenciesCollection}
        data-testid="currency"
        inputBehavior="autohighlight"
        {onInputValueChange}
        onOpenChange={() => (items = availableCurrencies)}
        onValueChange={(e) => (currency = e.value[0])}
        openOnClick
        required
        value={[currency]}
    >
        <Combobox.Control>
            <Combobox.Input>
                {#snippet element(props)}
                    <input {...props} name="currency" class="ig-input rounded-s-none uppercase ring-0 focus:ring-1" />
                {/snippet}
            </Combobox.Input>
            <Combobox.Trigger class="bg-transparent" />
        </Combobox.Control>
        <Portal>
            <Combobox.Positioner>
                <Combobox.Content class="max-h-80 overflow-auto">
                    {#each items as item (item)}
                        <Combobox.Item {item}>
                            <Combobox.ItemText>{item}</Combobox.ItemText>
                            <Combobox.ItemIndicator />
                        </Combobox.Item>
                    {:else}
                        <span>No currencies available.</span>
                    {/each}
                </Combobox.Content>
            </Combobox.Positioner>
        </Portal>
    </Combobox>
</div>

<input {id} {name} {disabled} type="hidden" bind:value />
