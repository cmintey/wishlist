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

<RadioGroup name="list-view-mode" class="flex">
    <RadioItem 
        name="list-view-mode" 
        value="tile" 
        bind:group={selectedValue} 
        title={$t("wishes.tile-view")}
        class="flex items-center justify-center rounded px-3 py-1.5 text-sm text-white hover:bg-primary-500 dark:hover:bg-primary-600"
        active="bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 dark:hover:bg-primary-600"
    >
        <iconify-icon icon="ion:grid" class="text-base"></iconify-icon>
    </RadioItem>
    <RadioItem 
        name="list-view-mode" 
        value="list" 
        bind:group={selectedValue} 
        title={$t("wishes.list-view")}
        class="flex items-center justify-center rounded px-3 py-1.5 text-sm text-white hover:bg-primary-500 dark:hover:bg-primary-600"
        active="bg-primary-500 dark:bg-primary-600 hover:bg-primary-500 dark:hover:bg-primary-600"
    >
        <iconify-icon icon="ion:list" class="text-base"></iconify-icon>
    </RadioItem>
</RadioGroup>
