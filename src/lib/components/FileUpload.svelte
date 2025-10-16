<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { FileUpload, type FileUploadRootProps } from "@skeletonlabs/skeleton-svelte";

    const props: FileUploadRootProps = $props();

    const t = getFormatter();
</script>

<FileUpload
    class="bg-surface-200-800 border-surface-500 rounded-base grid grid-cols-[auto_1fr] items-center gap-2 border"
    {...props}
>
    <FileUpload.Trigger class="btn btn-sm preset-filled py-1 pl-1">{$t("general.select-file")}</FileUpload.Trigger>
    <FileUpload.HiddenInput />
    <FileUpload.ItemGroup>
        <FileUpload.Context>
            {#snippet children(fileUpload)}
                {#if fileUpload().acceptedFiles.length === 1}
                    {@const file = fileUpload().acceptedFiles.at(0)!}
                    <FileUpload.Item {file}>
                        <FileUpload.ItemName>{file.name}</FileUpload.ItemName>
                        <FileUpload.ItemDeleteTrigger />
                    </FileUpload.Item>
                {:else}
                    <span>{$t("general.no-file-selected")}</span>
                {/if}
            {/snippet}
        </FileUpload.Context>
    </FileUpload.ItemGroup>
</FileUpload>
