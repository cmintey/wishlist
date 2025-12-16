<script lang="ts">
    import { onMount } from "svelte";
    import { cubicOut } from "svelte/easing";
    import { Tween } from "svelte/motion";

    const delay = 100;
    const progress = new Tween(0, {
        duration: 1000,
        easing: cubicOut
    });

    onMount(() => {
        const timer = setTimeout(() => {
            progress.set(90);
        }, delay);
        return () => clearTimeout(timer);
    });
</script>

{#if progress.current}
    <div class="absolute top-0 left-0 z-999999999 h-[3px] w-screen bg-white">
        <span
            style:width={`${progress.current}%`}
            class="bg-surface-50/50 dark:bg-surface-950/50 absolute h-[3px]"
        ></span>
    </div>
{/if}
