<script lang="ts">
    import { Steps, useSteps } from "@skeletonlabs/skeleton-svelte";

    interface Props {
        children: import("svelte").Snippet;
    }

    let { children }: Props = $props();
    const id = $props.id();
    const stepper = useSteps({ id });
</script>

<!-- <Stepper>
    {@render children?.()}
</Stepper> -->

<Steps.Provider value={stepper}>
    {@render children()}
</Steps.Provider>
