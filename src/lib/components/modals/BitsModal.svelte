<script lang="ts" module>
    import type { Snippet } from "svelte";

    type ChildSnippet = Snippet<[{ props: Record<string, unknown> }]>;
    export interface Props {
        trigger: ChildSnippet;
        title: string;
        description: Snippet;
        body?: Snippet;
        actions: ChildSnippet;
    }
</script>

<script lang="ts">
    import { AlertDialog } from "bits-ui";
    import { fly } from "svelte/transition";

    const props: Props = $props();
</script>

<AlertDialog.Root>
    <AlertDialog.Trigger child={props.trigger} />
    <AlertDialog.Portal>
        <AlertDialog.Overlay class="bg-surface-backdrop-token fixed inset-0 z-[999] items-center p-4" />

        <AlertDialog.Content>
            {#snippet child({ props: childProps, open })}
                {#if open}
                    <div
                        class="bg-surface-100-800-token w-modal modal fixed left-1/2 top-1/2 z-[999] h-auto -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto p-4 shadow-xl rounded-container-token"
                        {...childProps}
                        transition:fly
                    >
                        <AlertDialog.Title class="text-2xl font-bold">
                            {props.title}
                        </AlertDialog.Title>
                        <AlertDialog.Description class="text-foreground-alt text-sm">
                            {@render props.description()}
                        </AlertDialog.Description>
                        {@render props.body?.()}
                        {@render props.actions({ props: childProps })}
                    </div>
                {/if}
            {/snippet}
        </AlertDialog.Content>
    </AlertDialog.Portal>
</AlertDialog.Root>
