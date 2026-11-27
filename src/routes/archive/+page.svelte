<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";
    import ListViewModeChip from "$lib/components/wishlists/chips/ListViewModeChip.svelte";
    import { getListViewPreference, initListViewPreference } from "$lib/stores/list-view-preference.svelte";
    import type { PageProps } from "./$types";
    import ArchiveItemCard from "./ArchiveItemCard.svelte";

    const { data }: PageProps = $props();
    const t = getFormatter();
    // svelte-ignore state_referenced_locally
    initListViewPreference(data.initialViewPreference);
    let isTileView = $derived(getListViewPreference() === "tile");
    let pending = $state<number | null>(null);

    async function restore(id: number) {
        pending = id;
        try {
            const response = await fetch(`/api/items/${id}/archive`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: false })
            });
            if (!response.ok) throw new Error("Restore failed");
            await invalidateAll();
            toaster.info({ description: $t("archive.restored") });
        } catch {
            toaster.error({ description: $t("archive.failed") });
        } finally {
            pending = null;
        }
    }
</script>

<div class="flex justify-end pb-4"><ListViewModeChip {isTileView} /></div>
{#if data.items.length === 0}
    <p class="py-8 text-center text-2xl">{$t("archive.empty")}</p>
{:else}
    <div
        class={isTileView ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}
        data-testid="archive-container"
    >
        {#each data.items as item (item.id)}
            <ArchiveItemCard {isTileView} {item} onrestore={restore} pending={pending !== null} />
        {/each}
    </div>
{/if}

<svelte:head><title>{$t("archive.title")}</title></svelte:head>
