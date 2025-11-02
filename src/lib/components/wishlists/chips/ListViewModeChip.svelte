<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    interface Props {
        isTileView: boolean;
    }

    const { isTileView }: Props = $props();
    const t = getFormatter();
    
    const handleToggle = (tileView: boolean) => {
        const newUrl = new URL(page.url);
        
        if (tileView) {
            // Set to tile view
            newUrl.searchParams.set("view", "tile");
        } else {
            // Default to list view, so remove the parameter
            newUrl.searchParams.delete("view");
        }
        
        goto(newUrl, { replaceState: true });
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
