<script lang="ts" module>
    import type { Snippet } from "svelte";

    interface ActionProps {
        neutralStyle: ClassValue;
        negativeStyle: ClassValue;
        positiveStyle: ClassValue;
    }

    export interface BaseModalProps extends DialogRootProps {
        trigger: NonNullable<DialogTriggerProps["element"]>;
        title: string;
        description: Snippet | string;
        actions: Snippet<[ActionProps]>;
        children?: Snippet;
    }

    const actionProps: ActionProps = {
        neutralStyle: "preset-tonal-surface inset-ring inset-ring-surface-500 btn btn-sm md:btn-base",
        negativeStyle: "preset-tonal-error inset-ring inset-ring-error-500 btn btn-sm md:btn-base",
        positiveStyle: "preset-filled btn btn-sm md:btn-base"
    };
</script>

<script lang="ts">
    import { Dialog, Portal, type DialogRootProps, type DialogTriggerProps } from "@skeletonlabs/skeleton-svelte";
    import ModalBackdrop from "./parts/ModalBackdrop.svelte";
    import ModalContent from "./parts/ModalContent.svelte";
    import type { ClassValue } from "svelte/elements";

    let { trigger, title, description, actions, children, ...rest }: BaseModalProps = $props();
</script>

<Dialog {...rest}>
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
                <div class="flex flex-wrap justify-between gap-y-2">
                    {@render actions(actionProps)}
                </div>
            </ModalContent>
        </Dialog.Positioner>
    </Portal>
</Dialog>
