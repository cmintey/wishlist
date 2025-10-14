<script lang="ts">
    import { Progress } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        text: string;
    }

    let { text }: Props = $props();
</script>

<div
    class="fixed top-0 right-0 bottom-0 left-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-700 opacity-90"
>
    <Progress class="m-4" value={null}>
        <Progress.Circle class="w-16">
            <Progress.CircleTrack class="stroke-primary-500/30" />
            <Progress.CircleRange class="stroke-primary-500" />
        </Progress.Circle>
    </Progress>
    <span class="text-center text-white">{text}</span>
</div>
