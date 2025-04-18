<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLImgAttributes } from "svelte/elements";

    interface Props extends HTMLImgAttributes {
        children?: Snippet;
    }

    const { children, ...rest }: Props = $props();

    let imgError = $state(false);
</script>

{#if imgError}
    {@render children?.()}
{:else}
    <img {...rest} onerror={() => (imgError = true)} />
{/if}
