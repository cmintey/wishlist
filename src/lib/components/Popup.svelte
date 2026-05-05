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

    const transitionFade =
        "data-[state=closed]:opacity-0 data-[state=open]:opacity-100 starting:data-[state=closed]:opacity-100 starting:data-[state=open]:opacity-0";
    const transitionScale =
        "data-[state=closed]:scale-90 data-[state=open]:scale-100 starting:data-[state=closed]:scale-100 starting:data-[state=open]:scale-90";
</script>

<Popover autoFocus={false} onOpenChange={(e) => (open = e.open)} {open}>
    <Popover.Trigger element={trigger}></Popover.Trigger>
    <Portal>
        <Popover.Positioner class={zIndex}>
            <Popover.Content
                class="transition-all transition-discrete {transitionFade} {transitionScale}"
                element={content}
            ></Popover.Content>
        </Popover.Positioner>
    </Portal>
</Popover>
