<script lang="ts">
    import { Stepper } from "@skeletonlabs/skeleton";
    interface Props {
        children?: import("svelte").Snippet;
    }

    let { children }: Props = $props();
</script>

<Stepper>
    {@render children?.()}
</Stepper>
