<script lang="ts">
    import SvelteMarkdown, { type HtmlRenderers } from "@humanspeak/svelte-markdown";
    import Headers from "./md/Headers.svelte";
    import List from "./md/List.svelte";
    import Link from "./md/Link.svelte";

    interface Props {
        source: string;
    }

    const { source }: Props = $props();
    const renderers: HtmlRenderers = {
        heading: Headers,
        list: List,
        link: Link
    };
</script>

<SvelteMarkdown options={{ headerIds: false }} {renderers} {source} />
