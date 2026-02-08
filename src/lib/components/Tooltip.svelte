<script lang="ts">
    import { Popover, Portal } from "@skeletonlabs/skeleton-svelte";
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        label: Snippet;
        description: Snippet;
        icon?: Snippet;
        iconClass?: ClassValue;
    }

    const props: Props = $props();
</script>

<div class="flex items-center gap-2">
    {@render props.label()}
    <Popover>
        <Popover.Trigger aria-label="tooltip" type="button">
            <span class="flex content-center items-center">
                {#if props.icon}
                    {@render props.icon()}
                {:else}
                    <iconify-icon
                        class={["text-secondary-500", props.iconClass]}
                        icon="ion:help-circle-outline"
                    ></iconify-icon>
                {/if}
            </span>
        </Popover.Trigger>
        <Portal>
            <Popover.Positioner>
                <Popover.Content
                    class="card preset-filled-surface-500 z-20 w-80 p-4 transition-all transition-discrete data-[state=closed]:scale-95 data-[state=open]:scale-100 starting:data-[state=closed]:scale-100 starting:data-[state=open]:scale-95"
                >
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
