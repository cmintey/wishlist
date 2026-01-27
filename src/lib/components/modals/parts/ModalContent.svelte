<script lang="ts">
    import { Dialog } from "@skeletonlabs/skeleton-svelte";
    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
    }

    const { children }: Props = $props();
</script>

<Dialog.Content>
    {#snippet element(props)}
        <div
            {...props}
            class="card bg-surface-100-900 h-auto w-full max-w-xl space-y-4 overflow-y-auto p-4 shadow-xl transition transition-discrete data-[state=open]:opacity-100 starting:data-[state=open]:opacity-0"
        >
            {@render children()}
        </div>
    {/snippet}
</Dialog.Content>
