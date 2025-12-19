<script lang="ts">
    import { Popover, Portal, type PopoverContentProps, type PopoverTriggerProps } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        open?: boolean;
        trigger: PopoverTriggerProps["element"];
        content: PopoverContentProps["element"];
    }

    let { open = $bindable(false), trigger, content }: Props = $props();
</script>

<Popover autoFocus={false} onOpenChange={(e) => (open = e.open)} {open}>
    <Popover.Trigger element={trigger}></Popover.Trigger>
    <Portal>
        <Popover.Positioner>
            <Popover.Content element={content}></Popover.Content>
        </Popover.Positioner>
    </Portal>
</Popover>
