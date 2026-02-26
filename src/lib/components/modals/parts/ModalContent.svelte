<script lang="ts">
    import { Dialog } from "@skeletonlabs/skeleton-svelte";
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        children: Snippet;
        class?: ClassValue;
    }

    const { children, ...props }: Props = $props();
</script>

<Dialog.Content>
    {#snippet element(elProps)}
        <div
            {...elProps}
            class={[
                "card bg-surface-100-900 w-full max-w-xl space-y-4 overflow-y-auto p-4 shadow-xl transition-all transition-discrete data-[state=closed]:opacity-0 data-[state=open]:opacity-100 starting:data-[state=closed]:opacity-100 starting:data-[state=open]:opacity-0",
                props.class
            ]}
        >
            {@render children()}
        </div>
    {/snippet}
</Dialog.Content>
