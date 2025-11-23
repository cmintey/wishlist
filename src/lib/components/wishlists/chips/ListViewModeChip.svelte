<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { setListViewPreference } from "$lib/stores/list-view-preference.svelte";
    import { RadioGroup, RadioItem } from "@skeletonlabs/skeleton";

    interface Props {
        isTileView: boolean;
    }

    const { isTileView }: Props = $props();
    const t = getFormatter();

    let selectedValue: "list" | "tile" = $state(isTileView ? "tile" : "list");

    $effect(() => {
        // Save to localStorage for immediate update
        setListViewPreference(selectedValue);

        // Save to cookie for server-side rendering (prevents flicker on refresh)
        document.cookie = `listViewPreference=${selectedValue}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
    });
</script>

<RadioGroup
    name="list-view-mode"
    class="!rounded"
    active="variant-filled-primary"
    padding="py-0 px-2"
    rounded="rounded"
>
    <RadioItem
        name="list-view-mode"
        class="text-sm"
        title={$t("wishes.list-view")}
        value="list"
        bind:group={selectedValue}
    >
        <iconify-icon class="text-xs" icon="ion:list"></iconify-icon>
    </RadioItem>
    <RadioItem
        name="list-view-mode"
        class="text-sm"
        title={$t("wishes.tile-view")}
        value="tile"
        bind:group={selectedValue}
    >
        <iconify-icon class="text-xs" icon="ion:grid"></iconify-icon>
    </RadioItem>
</RadioGroup>
