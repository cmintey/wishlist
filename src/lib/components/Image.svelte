<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLImgAttributes } from "svelte/elements";

    interface Props extends HTMLImgAttributes {
        children?: Snippet;
    }

    const { children, src, ...rest }: Props = $props();

    let imgError = $state(false);
</script>

{#if imgError || !src}
    {@render children?.()}
{:else}
    <img {...rest} onerror={() => (imgError = true)} {src} />
{/if}
