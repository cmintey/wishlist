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
    import ModalBackdrop from "./parts/ModalBackdrop.svelte";
    import ModalContent from "./parts/ModalContent.svelte";

    let { trigger, title, description, actions, children }: BaseModalProps = $props();
</script>

<Dialog>
    <Dialog.Trigger element={trigger} />
    <Portal>
        <ModalBackdrop />

        <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center">
            <ModalContent>
                <Dialog.Title class="text-2xl font-bold">
                    {title}
                </Dialog.Title>
                <Dialog.Description>
                    {#if typeof description === "string"}
                        {@html description}
                    {:else}
                        {@render description()}
                    {/if}
                </Dialog.Description>
                {@render children?.()}
                {@render actions()}
            </ModalContent>
        </Dialog.Positioner>
    </Portal>
</Dialog>
