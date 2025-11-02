<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { listViewPreference } from "$lib/stores/list-view-preference";

    interface Props {
        isTileView: boolean;
    }

    const { isTileView }: Props = $props();
    const t = getFormatter();
    
    const handleToggle = async (tileView: boolean) => {
        const newValue = tileView ? "tile" : "list";
        
        // Save to localStorage for immediate update
        $listViewPreference = newValue;
        
        // Save to cookie for server-side rendering (prevents flicker on refresh)
        document.cookie = `listViewPreference=${newValue}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
    };
</script>

<div class="flex rounded-lg p-1">
    <button
        class="flex items-center justify-center rounded-md px-3 py-1.5 text-sm transition-colors"
        class:bg-primary-500={isTileView}
        class:bg-primary-600={isTileView}
        class:text-white={true}
        class:hover:bg-primary-400={isTileView}
        class:hover:bg-primary-700={isTileView}
        class:hover:bg-surface-200={!isTileView}
        class:hover:bg-surface-700={!isTileView}
        onclick={() => handleToggle(true)}
        title={$t("wishes.tile-view")}
    >
        <iconify-icon icon="ion:grid" class="text-base"></iconify-icon>
    </button>
    <button
        class="flex items-center justify-center rounded-md px-3 py-1.5 text-sm transition-colors"
        class:bg-primary-500={!isTileView}
        class:bg-primary-600={!isTileView}
        class:text-white={true}
        class:hover:bg-primary-400={!isTileView}
        class:hover:bg-primary-700={!isTileView}
        class:hover:bg-surface-200={isTileView}
        class:hover:bg-surface-700={isTileView}
        onclick={() => handleToggle(false)}
        title={$t("wishes.list-view")}
    >
        <iconify-icon icon="ion:list" class="text-base"></iconify-icon>
    </button>
</div>
