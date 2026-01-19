<script lang="ts">
    import ClaimButtons from "../ClaimButtons.svelte";
    import type { InternalItemCardProps } from "../ItemCard.svelte";
    import ManageButtons from "../ManageButtons.svelte";
    import ReorderButtons from "../ReorderButtons.svelte";

    const props: Omit<InternalItemCardProps, "id" | "defaultImage"> = $props();
</script>

<footer
    class={[
        "flex flex-wrap items-center gap-2 px-4 print:hidden",
        props.reorderActions ? "justify-center pb-0" : "justify-between pb-4"
    ]}
>
    {#if props.reorderActions}
        <ReorderButtons {...props} />
    {:else}
        <ClaimButtons {...props} />
        <ManageButtons {...props} />
    {/if}
</footer>
