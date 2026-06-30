<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import Popup from "$lib/components/Popup.svelte";
    import { getFormatter } from "$lib/i18n";
    import { Popover } from "@skeletonlabs/skeleton-svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        options: Option[];
        defaultOption: Option;
        searchParam: string;
        label?: string;
        directionParam?: string | undefined;
        prefix?: string;
        multiselect?: boolean;
        class?: ClassValue;
        testId?: string;
    }

    const {
        options,
        defaultOption,
        searchParam,
        label,
        directionParam = undefined,
        prefix = undefined,
        multiselect = false,
        class: clazz,
        testId
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

    let menuOpen = $state(false);

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
            menuOpen = false;
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

<div class={["flex flex-col gap-1", clazz]} data-testid={testId}>
    {#if label}
        <span class="text-xs">{label}</span>
    {/if}
    <Popup bind:open={menuOpen}>
        {#snippet trigger(props)}
            <button
                {...props}
                class={[
                    "inset-ring-primary-500 chip h-fit w-fit inset-ring",
                    selectedOptions[0].value !== defaultOption.value &&
                        "preset-tonal-primary inset-ring-primary-500 inset-ring"
                ]}
            >
                {#if selectedOptions[0].direction === "asc"}
                    <iconify-icon icon="ion:arrow-up"></iconify-icon>
                {:else if selectedOptions[0].direction === "desc"}
                    <iconify-icon icon="ion:arrow-down"></iconify-icon>
                {:else if prefix}
                    <iconify-icon icon={prefix}></iconify-icon>
                {/if}
                <div class="flex gap-x-1">
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
        {/snippet}

        {#snippet content(props)}
            <div
                {...props}
                class={["card preset-filled-surface-100-900 list-nav z-10 max-h-96 p-4 shadow-xl", props?.class]}
            >
                <nav>
                    <ul class="max-h-72 overflow-auto">
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
                        <div class="flex flex-row justify-between gap-x-2 pt-4">
                            <Popover.CloseTrigger
                                id="cancel"
                                class="preset-tonal-secondary border-secondary-500 btn btn-sm border"
                                onclick={handleCancel}
                            >
                                {$t("general.cancel")}
                            </Popover.CloseTrigger>
                            <Popover.CloseTrigger
                                id="apply"
                                class="preset-filled-primary-500 btn btn-sm"
                                onclick={() => handleApply()}
                            >
                                {$t("general.apply")}
                            </Popover.CloseTrigger>
                        </div>
                    {/if}
                </nav>
            </div>
        {/snippet}
    </Popup>
</div>
