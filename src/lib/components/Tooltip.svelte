<script lang="ts">
    import { Popover, Portal } from "@skeletonlabs/skeleton-svelte";
    import type { Snippet } from "svelte";

    interface Props {
        label: Snippet;
        description: Snippet;
        icon?: Snippet;
    }

    const props: Props = $props();
</script>

<div class="flex items-center gap-2">
    {@render props.label()}
    <Popover>
        <Popover.Trigger class="mt-0.5" aria-label="tooltip" type="button">
            <span class="flex content-center items-center">
                {#if props.icon}
                    {@render props.icon()}
                {:else}
                    <iconify-icon class="text-secondary-500" icon="ion:help-circle-outline"></iconify-icon>
                {/if}
            </span>
        </Popover.Trigger>
        <Portal>
            <Popover.Positioner>
                <Popover.Content class="card preset-filled-surface-500 z-20 w-80 p-4">
                    <Popover.Description>
                        {@render props.description()}
                    </Popover.Description>
                    <Popover.Arrow
                        style="--arrow-size: calc(var(--spacing) * 2); --arrow-background: var(--color-surface-500);"
                    >
                        <Popover.ArrowTip />
                    </Popover.Arrow>
                </Popover.Content>
            </Popover.Positioner>
        </Portal>
    </Popover>
</div>
