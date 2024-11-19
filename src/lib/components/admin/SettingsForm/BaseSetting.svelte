<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        title: string;
        children: Snippet;
    }

    const { title, children }: Props = $props();
</script>

<div class="flex flex-col space-y-2">
    <h3 class="h3">{title}</h3>
    {@render children()}
</div>
