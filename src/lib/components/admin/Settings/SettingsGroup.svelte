<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
    }

    const { children }: Props = $props();
</script>

<div class="card flex flex-col gap-2 px-4 py-2">
    {@render children()}
</div>
