<script lang="ts">
    import { ProgressRing } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        text: string;
    }

    let { text }: Props = $props();
</script>

<div
    class="fixed top-0 right-0 bottom-0 left-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-700 opacity-90"
>
    <div class="m-4">
        <ProgressRing meter="stroke-primary-500" stroke={64} track="stroke-primary-500/30" width="w-16" />
    </div>
    <span class="text-center text-white">{text}</span>
</div>
