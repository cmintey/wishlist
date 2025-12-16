<script lang="ts">
    import { ToastProvider } from "@skeletonlabs/skeleton-svelte";
    import { toaster } from ".";
</script>

<Toast.Group {toaster}>
    {#snippet children(toast)}
        <ToastProvider {toast}>
            <Toast.Message>
                {#if toast.title}
                    <Toast.Title>{toast.title}</Toast.Title>
                {/if}
                <Toast.Description>{toast.description}</Toast.Description>
            </Toast.Message>
            <Toast.CloseTrigger />
        </ToastProvider>
    {/snippet}
</Toast.Group>
