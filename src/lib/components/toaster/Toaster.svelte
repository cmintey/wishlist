<script lang="ts">
    import { Toast } from "@skeletonlabs/skeleton-svelte";
    import { toaster } from ".";

    interface Props {
        yShift: number | undefined;
    }

    let { yShift }: Props = $props();
</script>

<Toast.Group style={yShift ? `bottom: ${yShift}px` : undefined} {toaster}>
    {#snippet children(toast)}
        <Toast class="rounded-container" {toast}>
            <Toast.Message>
                {#if toast.title}
                    <Toast.Title>{toast.title}</Toast.Title>
                {/if}
                <Toast.Description>{toast.description}</Toast.Description>
            </Toast.Message>
            <Toast.CloseTrigger />
        </Toast>
    {/snippet}
</Toast.Group>
