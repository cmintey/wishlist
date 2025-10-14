<script lang="ts">
    import { onMount } from "svelte";
    import { cubicOut } from "svelte/easing";
    import { tweened } from "svelte/motion";
    const progress = tweened(0, {
        duration: 1000,
        easing: cubicOut
    });
    onMount(() => {
        progress.set(90);
    });
</script>

<div class="absolute top-0 left-0 z-999999999 h-[3px] w-screen bg-white">
    <span style:width={`${$progress}%`} class="bg-surface-50/50 dark:bg-surface-950/50 absolute h-[3px]"></span>
</div>
