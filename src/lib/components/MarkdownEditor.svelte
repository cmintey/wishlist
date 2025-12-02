<script lang="ts">
    import { Tab, TabGroup } from "@skeletonlabs/skeleton";
    import Markdown from "./Markdown.svelte";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        id: string;
        name: string;
        placeholder?: string;
        value?: string | null;
    }
    let { value, ...rest }: Props = $props();
    const t = getFormatter();

    let previewNote = $state(false);
</script>

<div class="card p-2">
    <TabGroup border="border-none">
        <Tab name={$t("wishes.write")} value={false} bind:group={previewNote}>{$t("wishes.write")}</Tab>
        <Tab name={$t("wishes.preview")} value={true} bind:group={previewNote}>{$t("wishes.preview")}</Tab>
    </TabGroup>
    <textarea {...rest} class="textarea" class:hidden={previewNote} rows="4" bind:value></textarea>
    {#if previewNote}
        {#if value}
            <div
                class="variant-ringed-surface h-28 max-w-none overflow-auto whitespace-pre-wrap px-3 py-2 rounded-container-token"
                data-testid="markdown-preview"
            >
                <Markdown source={value} />
            </div>
        {/if}
    {/if}
    <a class="variant-soft btn btn-sm mt-1" href="https://www.markdownguide.org/basic-syntax/" target="_blank">
        <iconify-icon icon="ion:logo-markdown"></iconify-icon>
        <span>{$t("wishes.supports-markdown")}</span>
    </a>
</div>
