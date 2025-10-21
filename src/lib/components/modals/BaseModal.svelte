<script lang="ts" module>
    import type { Snippet } from "svelte";

    export interface BaseModalProps extends DialogRootProps {
        trigger: NonNullable<DialogTriggerProps["element"]>;
        title: string;
        description: Snippet | string;
        actions: Snippet;
        children?: Snippet;
    }
</script>

<script lang="ts">
    import { Dialog, Portal, type DialogRootProps, type DialogTriggerProps } from "@skeletonlabs/skeleton-svelte";
    import { fade, fly } from "svelte/transition";

    let { trigger, title, description, actions, children }: BaseModalProps = $props();
</script>

<Dialog>
    <Dialog.Trigger element={trigger} />
    <Portal>
        <Dialog.Backdrop>
            {#snippet element(props)}
                <div
                    class="bg-surface-backdrop-token fixed inset-0 z-[999] items-center p-4"
                    transition:fade={{ duration: 150 }}
                    {...props}
                ></div>
            {/snippet}
        </Dialog.Backdrop>

        <Dialog.Content>
            {#snippet element(props)}
                <div
                    class="bg-surface-100-800-token w-modal modal rounded-container-token fixed top-1/2 left-1/2 z-[999] h-auto -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto p-4 shadow-xl"
                    {...props}
                    transition:fly={{ duration: 150, opacity: 0, x: 0, y: 100 }}
                >
                    <Dialog.Title class="text-2xl font-bold">
                        {title}
                    </Dialog.Title>
                    <Dialog.Description>
                        {#if typeof description === "string"}
                            {description}
                        {:else}
                            {@render description()}
                        {/if}
                    </Dialog.Description>
                    {@render children?.()}
                    {@render actions()}
                </div>
            {/snippet}
        </Dialog.Content>
    </Portal>
</Dialog>
