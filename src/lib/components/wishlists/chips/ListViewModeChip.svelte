<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { listViewPreference } from "$lib/stores/list-view-preference";
    import { RadioGroup, RadioItem } from "@skeletonlabs/skeleton";

    interface Props {
        isTileView: boolean;
    }

    const { isTileView }: Props = $props();
    const t = getFormatter();

    let selectedValue: "list" | "tile" = $state(isTileView ? "tile" : "list");

    // Sync with prop changes
    $effect(() => {
        selectedValue = isTileView ? "tile" : "list";
    });

    // Handle value changes
    $effect(() => {
        if (selectedValue !== (isTileView ? "tile" : "list")) {
            // Save to localStorage for immediate update
            $listViewPreference = selectedValue;

            // Save to cookie for server-side rendering (prevents flicker on refresh)
            document.cookie = `listViewPreference=${selectedValue}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
        }
    });
</script>

<RadioGroup
    name="list-view-mode"
    class="!rounded p-0.5"
    active="variant-filled-primary"
    padding="py-0 px-3"
    rounded="rounded"
>
    <RadioItem name="list-view-mode" title={$t("wishes.list-view")} value="list" bind:group={selectedValue}>
        <iconify-icon class="text-xs" icon="ion:list"></iconify-icon>
    </RadioItem>
    <RadioItem name="list-view-mode" title={$t("wishes.tile-view")} value="tile" bind:group={selectedValue}>
        <iconify-icon class="text-xs" icon="ion:grid"></iconify-icon>
    </RadioItem>
</RadioGroup>
