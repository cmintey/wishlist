<script lang="ts">
    import {
        Popover,
        Portal,
        usePopover,
        type PopoverContentProps,
        type PopoverTriggerProps
    } from "@skeletonlabs/skeleton-svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        open?: boolean;
        trigger: PopoverTriggerProps["element"];
        content: PopoverContentProps["element"];
        zIndex?: ClassValue;
        forceMount?: boolean;
    }

    let { open = $bindable(false), trigger, content, zIndex, forceMount = false }: Props = $props();

    const id = $props.id();
    const popover = usePopover(() => ({ id, autoFocus: false, open, onOpenChange: (e) => (open = e.open) }));

    let mount = $state(false);

    $effect(() => {
        if (popover().open) {
            mount = true;
        } else {
            setTimeout(() => (mount = false), 200);
        }
    });

    const transitionFade =
        "data-[state=closed]:opacity-0 data-[state=open]:opacity-100 starting:data-[state=closed]:opacity-100 starting:data-[state=open]:opacity-0";
    const transitionScale =
        "data-[state=closed]:scale-90 data-[state=open]:scale-100 starting:data-[state=closed]:scale-100 starting:data-[state=open]:scale-90";
</script>

<Popover.Provider value={popover}>
    <Popover.Trigger element={trigger}></Popover.Trigger>
    {#if forceMount || mount}
        <Portal>
            <Popover.Positioner class={zIndex}>
                <Popover.Content
                    class="transition-all transition-discrete {transitionFade} {transitionScale}"
                    element={content}
                ></Popover.Content>
            </Popover.Positioner>
        </Portal>
    {/if}
</Popover.Provider>
