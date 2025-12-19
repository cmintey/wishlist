<script lang="ts">
    import { getFormatter } from "$lib/i18n";
    import { FileUpload, type FileUploadRootProps } from "@skeletonlabs/skeleton-svelte";

    const props: FileUploadRootProps = $props();

    const t = getFormatter();
</script>

<FileUpload {...props} class="input-group grid-cols-[auto_1fr] items-center p-1">
    <FileUpload.Trigger class="btn btn-sm preset-filled h-fit">{$t("general.select-file")}</FileUpload.Trigger>
    <FileUpload.HiddenInput />
    <FileUpload.ItemGroup>
        <FileUpload.Context>
            {#snippet children(fileUpload)}
                {#if fileUpload().acceptedFiles.length === 1}
                    {@const file = fileUpload().acceptedFiles.at(0)!}
                    <FileUpload.Item {file}>
                        <FileUpload.ItemName class="truncate">{file.name}</FileUpload.ItemName>
                        <FileUpload.ItemDeleteTrigger />
                    </FileUpload.Item>
                {:else}
                    <span class="text-base">
                        {$t("general.no-file-selected")}
                    </span>
                {/if}
            {/snippet}
        </FileUpload.Context>
    </FileUpload.ItemGroup>
</FileUpload>
