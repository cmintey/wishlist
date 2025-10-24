<script lang="ts">
    import { Popover, Portal, type PopoverContentProps, type PopoverTriggerProps } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        trigger: PopoverTriggerProps["element"];
        content: PopoverContentProps["element"];
    }

    const { trigger, content }: Props = $props();
</script>

<Popover autoFocus={false}>
    <Popover.Trigger element={trigger}></Popover.Trigger>
    <Portal>
        <Popover.Positioner>
            <Popover.Content element={content}></Popover.Content>
        </Popover.Positioner>
    </Portal>
</Popover>
