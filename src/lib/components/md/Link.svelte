<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        href?: string;
        title?: string;
        children?: Snippet;
    }
    const { href = "", title = undefined, children }: Props = $props();
</script>

<a class="aside" {href} onclick={(e) => e.stopPropagation()} {title}>{@render children?.()}</a>
