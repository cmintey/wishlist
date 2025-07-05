<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { getFormatter } from "$lib/i18n";
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";

    interface Props {
        options: Option[];
        defaultOption: Option;
        searchParam: string;
        directionParam?: string | undefined;
        prefix?: string;
        multiselect?: boolean;
    }

    const {
        options,
        defaultOption,
        searchParam,
        directionParam = undefined,
        prefix = undefined,
        multiselect = false
    }: Props = $props();
    const t = getFormatter();

    let filter = $derived(page.url.searchParams.get(searchParam));
    let direction = $derived(directionParam ? page.url.searchParams.get(searchParam) : null);
    let selectedOptions: Option[] = $state([defaultOption]);
    let pendingSelectedOptions: Option[] = $state([defaultOption]);
    $effect(() => {
        if (multiselect && filter) {
            const filters = decodeURIComponent(filter).split(",");
            const opts = [];
            for (const option of options) {
                if (filters.includes(option.value)) {
                    opts.push(option);
                }
            }
            pendingSelectedOptions = opts;
            selectedOptions = opts;
        } else if (filter) {
            for (const option of options) {
                if (filter === option.value) {
                    if (direction && option.direction && option.direction === direction) {
                        selectedOptions = [option];
                        break;
                    } else {
                        selectedOptions = [option];
                        break;
                    }
                }
            }
        } else {
            selectedOptions = [defaultOption];
        }
    });

    const popupKey = `${searchParam}-options`;
    let menuOpen = $state(false);
    const menuSettings: PopupSettings = {
        event: "click",
        target: popupKey,
        state: ({ state }) => (menuOpen = state),
        closeQuery: multiselect ? "#apply, #cancel" : undefined
    };

    const isOnlyDefaultOptionSelected = (opts: Option[]) => {
        return opts.length === 1 && opts[0].value === defaultOption.value;
    };
    const handleSelectChange = (option: Option, checked: boolean) => {
        if (checked) {
            if (isOnlyDefaultOptionSelected(pendingSelectedOptions)) {
                pendingSelectedOptions = [option];
            } else if (option.value === defaultOption.value) {
                pendingSelectedOptions = [defaultOption];
            } else {
                pendingSelectedOptions.push(option);
            }
        } else {
            pendingSelectedOptions = pendingSelectedOptions.filter((opt) => opt.value !== option.value);
        }
    };
    const handleApply = (option?: Option) => {
        if (option) {
            selectedOptions = [option];
        } else {
            selectedOptions = pendingSelectedOptions;
        }

        const newUrl = new URL(page.url);

        if (isOnlyDefaultOptionSelected(selectedOptions)) {
            newUrl.searchParams.delete(searchParam);
            if (!multiselect && directionParam) newUrl.searchParams.delete(directionParam);
        } else {
            const value = selectedOptions.map((opt) => opt.value).join(",");
            newUrl.searchParams.set(searchParam, encodeURIComponent(value));
            if (!multiselect && directionParam && selectedOptions[0].direction) {
                newUrl.searchParams.set(directionParam, selectedOptions[0].direction);
            }
        }

        goto(newUrl, {
            replaceState: true
        });
    };
    const handleCancel = () => {
        pendingSelectedOptions = selectedOptions;
    };
    const isSelected = (option: Option) => {
        return pendingSelectedOptions.find((opt) => opt.value === option.value) !== undefined;
    };
</script>

<div class="flex flex-row space-x-4 pb-4">
    <button
        class="variant-ringed-primary chip"
        class:variant-ghost-primary={selectedOptions[0].value !== defaultOption.value}
        use:popup={menuSettings}
    >
        {#if selectedOptions[0].direction === "asc"}
            <iconify-icon icon="ion:arrow-up"></iconify-icon>
        {:else if selectedOptions[0].direction === "desc"}
            <iconify-icon icon="ion:arrow-down"></iconify-icon>
        {:else if prefix}
            <iconify-icon icon={prefix}></iconify-icon>
        {/if}
        <div class="flex space-x-1">
            <span>
                {selectedOptions[0].displayValue}
            </span>
            {#if multiselect && selectedOptions.length > 1}
                <span>
                    +{selectedOptions.length - 1}
                </span>
            {/if}
        </div>
        <iconify-icon
            class="arrow text-xs duration-300 ease-out"
            class:rotate-180={menuOpen}
            icon="ion:caret-down"
        ></iconify-icon>
    </button>
    <nav class="card list-nav z-10 max-h-96 p-4 shadow-xl" data-popup={popupKey}>
        <ul class="max-h-72 overflow-scroll">
            {#each options as option (option.value + option.direction)}
                <li>
                    {#if multiselect}
                        <label class="checkbox-label list-option">
                            <input
                                class="checkbox"
                                checked={isSelected(option)}
                                onchange={(e) => handleSelectChange(option, e.currentTarget.checked)}
                                type="checkbox"
                            />
                            <span>{option.displayValue}</span>
                        </label>
                    {:else}
                        <button class="list-option w-full" onclick={() => handleApply(option)}>
                            {option.displayValue}
                        </button>
                    {/if}
                </li>
            {/each}
        </ul>
        {#if multiselect}
            <div class="flex flex-row justify-between space-x-2 pt-4">
                <button id="cancel" class="variant-ghost-secondary btn btn-sm" onclick={handleCancel}>
                    {$t("general.cancel")}
                </button>
                <button id="apply" class="variant-filled-primary btn btn-sm" onclick={() => handleApply()}>
                    {$t("general.apply")}
                </button>
            </div>
        {/if}
    </nav>
</div>
