<script lang="ts" module>
    import { type Readable } from "svelte/store";

    type UnwrapReadable<T> = T extends Readable<infer U> ? U : never;
    type Trigger = UnwrapReadable<ReturnType<typeof createDialog>["elements"]["trigger"]>;
    type Actions = UnwrapReadable<ReturnType<typeof createDialog>["elements"]["close"]>;

    export interface Props {
        trigger: Snippet<[Trigger]>;
        title: string;
        description: Snippet;
        body?: Snippet;
        actions: Snippet<[Actions]>;
        role?: "dialog" | "alertdialog";
    }
</script>

<script lang="ts">
    import { createDialog, melt } from "@melt-ui/svelte";
    import type { Snippet } from "svelte";
    import { fly } from "svelte/transition";

    const { role = "dialog", ...props }: Props = $props();

    const {
        elements: { trigger, portalled, overlay, content, title, description, close },
        states: { open }
    } = createDialog({ role });
</script>

{@render props.trigger($trigger)}

{#if $open}
    <div use:melt={$portalled}>
        <div class="bg-surface-backdrop-token fixed inset-0 z-[999] items-center p-4" use:melt={$overlay}></div>
        <div
            class="bg-surface-100-800-token w-modal modal fixed left-1/2 top-1/2 z-[999] h-auto -translate-x-1/2 -translate-y-1/2 space-y-4 overflow-y-auto p-4 shadow-xl rounded-container-token"
            use:melt={$content}
            transition:fly={{ duration: 150, opacity: 0, x: 0, y: 100 }}
        >
            <header class="text-2xl font-bold" use:melt={$title}>{props.title}</header>
            <p use:melt={$description}>{@render props.description()}</p>
            {#if props.body}
                {@render props.body()}
            {/if}
            {@render props.actions($close)}
        </div>
    </div>
{/if}
