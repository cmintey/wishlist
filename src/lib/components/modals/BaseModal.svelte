<script lang="ts" module>
    import type { Snippet } from "svelte";

    type ChildSnippet = Snippet<[{ props: Record<string, unknown> }]>;
    export interface Props extends Dialog.RootProps {
        trigger: ChildSnippet;
        title: string;
        description: Snippet;
        actions: Snippet;
        children?: Snippet;
    }
</script>

<script lang="ts">
    import { Dialog } from "bits-ui";
    import { fade, fly } from "svelte/transition";

    let { trigger, title, description, actions, children, open = $bindable(false) }: Props = $props();
</script>

<Dialog.Root bind:open>
    <Dialog.Trigger child={trigger} />
    <Dialog.Portal>
        <Dialog.Overlay forceMount>
            {#snippet child({ props, open })}
                {#if open}
                    <div
                        class="bg-surface-backdrop-token fixed inset-0 z-[999] items-center p-4"
                        transition:fade={{ duration: 150 }}
                        {...props}
                    ></div>
                {/if}
            {/snippet}
        </Dialog.Overlay>

        <Dialog.Content forceMount>
            {#snippet child({ props, open })}
                {#if open}
                    <div
                        class="bg-surface-100-800-token w-modal modal fixed left-1/2 top-1/2 z-[999] h-auto -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto p-4 shadow-xl rounded-container-token"
                        {...props}
                        transition:fly={{ duration: 150, opacity: 0, x: 0, y: 100 }}
                    >
                        <Dialog.Title class="text-2xl font-bold">
                            {title}
                        </Dialog.Title>
                        <Dialog.Description>
                            {@render description()}
                        </Dialog.Description>
                        {@render children?.()}
                        {@render actions()}
                    </div>
                {/if}
            {/snippet}
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
