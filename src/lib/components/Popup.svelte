<script lang="ts">
    import { Popover, Portal, type PopoverContentProps, type PopoverTriggerProps } from "@skeletonlabs/skeleton-svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        open?: boolean;
        trigger: PopoverTriggerProps["element"];
        content: PopoverContentProps["element"];
        zIndex?: ClassValue;
    }

    let { open = $bindable(false), trigger, content, zIndex }: Props = $props();
</script>

<Popover autoFocus={false} onOpenChange={(e) => (open = e.open)} {open}>
    <Popover.Trigger element={trigger}></Popover.Trigger>
    <Portal>
        <Popover.Positioner class={zIndex}>
            <Popover.Content element={content}></Popover.Content>
        </Popover.Positioner>
    </Portal>
</Popover>
