<script lang="ts">
    import { clipboard, popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    interface Props {
        url: string;
        btnStyle?: string;
        children?: import("svelte").Snippet;
    }

    let { url, btnStyle = "btn-icon", children }: Props = $props();
    const dispatch = createEventDispatcher();

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
            type="button"
            aria-label="copy to clipboard"
            onclick={() => {
                dispatch("copied");
                copiedVisible = true;
                setTimeout(() => (copiedVisible = false), 1000);
            }}
            use:clipboard={{ element: "tokenUrl" }}
            use:popup={tooltipSettings}
        >
            <iconify-icon icon="ion:copy"></iconify-icon>
        </button>
        <div class="card variant-filled-secondary p-2" data-popup="copy">
            Copy to clipboard
            <div class="variant-filled-secondary arrow"></div>
        </div>
        {#if copiedVisible}
            <span out:fade>Copied!</span>
        {/if}
    </div>
</div>
