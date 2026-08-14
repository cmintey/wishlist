<script lang="ts">
    import ClaimButtons from "../ClaimButtons.svelte";
    import type { InternalItemCardProps } from "../ItemCard.svelte";
    import ManageButtons from "../ManageButtons.svelte";
    import ReorderButtons from "../ReorderButtons.svelte";

    interface Props extends Omit<InternalItemCardProps, "id" | "defaultImage"> {
        onEdit?: VoidFunction;
        noPadding?: boolean;
    }

    const props: Props = $props();

    let isClaimButtonVisible = $state(false);
</script>

<footer
    class={[
        "flex items-center gap-2 print:hidden",
        props.noPadding ? "px-0" : "px-4",
        props.reorderActions ? "justify-center pb-0" : "justify-between pb-4",
        isClaimButtonVisible && "flex-wrap"
    ]}
>
    {#if props.reorderActions}
        <ReorderButtons {...props} />
    {:else}
        <ClaimButtons isClaimableOrClaimed={(ans) => (isClaimButtonVisible = ans)} {...props} />
        <ManageButtons {...props} />
    {/if}
</footer>
