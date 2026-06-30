<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        title: string;
        children: Snippet;
    }

    const { title, children }: Props = $props();
    const id = $props.id();
</script>

<section
    class="card preset-filled-surface-100-900 border-surface-200-800 flex flex-col gap-2 border px-4 py-2"
    aria-labelledby={`header-${id}`}
>
    <h3 id={`header-${id}`} class="h3">{title}</h3>
    {@render children()}
</section>
