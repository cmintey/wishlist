<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLLabelAttributes } from "svelte/elements";

    interface Props extends HTMLLabelAttributes {
        value: string;
        children: Snippet;
    }

    let { value, children, ...props }: Props = $props();
</script>

<label {...props} class={["label", props.class]}>
    <span>{value}</span>
    {@render children()}
</label>
