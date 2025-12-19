<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { setListViewPreference } from "$lib/stores/list-view-preference.svelte";
    import { SegmentedControl } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        isTileView: boolean;
    }

    const { isTileView }: Props = $props();
    const t = getFormatter();

    let selectedValue: string | null = $state(isTileView ? "tile" : "list");

    $effect(() => {
        if (selectedValue === "list" || selectedValue === "tile") {
            // Save to localStorage for immediate update
            setListViewPreference(selectedValue);

            // Save to cookie for server-side rendering (prevents flicker on refresh)
            document.cookie = `listViewPreference=${selectedValue}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
        }
    });
</script>

<SegmentedControl onValueChange={(e) => (selectedValue = e.value)} value={selectedValue}>
    <SegmentedControl.Control class="h-6.5 p-px">
        <SegmentedControl.Indicator class="preset-filled-primary-500" />
        <SegmentedControl.Item aria-label={$t("wishes.list-view")} title={$t("wishes.list-view")} value="list">
            <SegmentedControl.ItemText>
                <iconify-icon class="text-xs" icon="ion:list"></iconify-icon>
            </SegmentedControl.ItemText>
            <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
        <SegmentedControl.Item aria-label={$t("wishes.tile-view")} title={$t("wishes.tile-view")} value="tile">
            <SegmentedControl.ItemText>
                <iconify-icon class="text-xs" icon="ion:grid"></iconify-icon>
            </SegmentedControl.ItemText>
            <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
    </SegmentedControl.Control>
</SegmentedControl>
