<script lang="ts">
    import { clipboard, popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import { fade } from "svelte/transition";
    import { getFormatter } from "$lib/i18n";

    interface Props {
        url: string;
        btnStyle?: string;
        children?: import("svelte").Snippet;
        onCopied?: VoidFunction;
    }

    let { url, btnStyle = "btn-icon", children, onCopied }: Props = $props();
    const t = getFormatter();

    let copiedVisible = $state(false);

    const tooltipSettings: PopupSettings = {
        event: "hover",
        target: "copy"
    };
</script>

<div class="w-100 flex flex-row items-center">
    <span class="text-ellipsis">
        <a href={url}>
            {@render children?.()}
        </a>
        <span data-clipboard="tokenUrl" hidden>{url}</span>
    </span>
    <div class="flex flex-row items-center">
        <button
            class="btn {btnStyle}"
            aria-label={$t("general.copy-to-clipboard")}
            onclick={() => {
                onCopied?.();
                copiedVisible = true;
                setTimeout(() => (copiedVisible = false), 1000);
            }}
            type="button"
            use:clipboard={{ element: "tokenUrl" }}
            use:popup={tooltipSettings}
        >
            <iconify-icon icon="ion:copy"></iconify-icon>
        </button>
        <div class="card variant-filled-secondary p-2" data-popup="copy">
            {$t("general.copy-to-clipboard")}
            <div class="variant-filled-secondary arrow"></div>
        </div>
        {#if copiedVisible}
            <span out:fade>{$t("general.copied")}</span>
        {/if}
    </div>
</div>
