<script lang="ts">
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
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

    let currentTab = $state("write");
    let previewNote = $derived(currentTab === "preview");
</script>

<div class="card preset-filled-surface-100-900 p-2">
    <Tabs class="border-none" onValueChange={({ value }) => (currentTab = value)} value={currentTab}>
        <Tabs.List>
            <Tabs.Trigger value={"write"}>{$t("wishes.write")}</Tabs.Trigger>
            <Tabs.Trigger value={"preview"}>{$t("wishes.preview")}</Tabs.Trigger>
        </Tabs.List>
    </Tabs>
    <textarea {...rest} class="textarea" class:hidden={previewNote} rows="4" bind:value></textarea>
    {#if previewNote}
        {#if value}
            <div
                class="preset-outlined-surface-500 rounded-container h-28 max-w-none overflow-scroll px-3 py-2 whitespace-pre-wrap"
                data-testid="markdown-preview"
            >
                <Markdown source={value} />
            </div>
        {/if}
    {/if}
    <a class="preset-tonal btn btn-sm mt-1" href="https://www.markdownguide.org/basic-syntax/" target="_blank">
        <iconify-icon icon="ion:logo-markdown"></iconify-icon>
        <span>{$t("wishes.supports-markdown")}</span>
    </a>
</div>
