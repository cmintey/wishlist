<script lang="ts">
    import { Dialog } from "@skeletonlabs/skeleton-svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        class?: ClassValue;
    }

    let props: Props = $props();
</script>

<Dialog.Backdrop
    class={[
        "bg-surface-800/70 fixed inset-0 z-40 items-center p-4 transition-all transition-discrete data-[state=closed]:opacity-0 data-[state=open]:opacity-100 starting:data-[state=closed]:opacity-100 starting:data-[state=open]:opacity-0",
        props?.class
    ]}
></Dialog.Backdrop>
