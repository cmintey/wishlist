<script lang="ts">
    import { clipboard, popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    export let url: string;
    export let btnStyle = "btn-icon";
    const dispatch = createEventDispatcher();

    let copiedVisible = false;

    const tooltipSettings: PopupSettings = {
        event: "hover",
        target: "copy"
    };
</script>

<div class="w-100 flex flex-row items-center">
    <span class="text-ellipsis">
        <a href={url}>
            <slot />
        </a>
        <span data-clipboard="tokenUrl" hidden>{url}</span>
    </span>
    <div class="flex flex-row items-center">
        <button
            class="btn {btnStyle}"
            type="button"
            on:click={() => {
                dispatch("copied");
                copiedVisible = true;
                setTimeout(() => (copiedVisible = false), 1000);
            }}
            use:clipboard={{ element: "tokenUrl" }}
            use:popup={tooltipSettings}
        >
            <iconify-icon icon="ion:copy" />
        </button>
        <div class="card variant-filled-secondary p-2" data-popup="copy">
            Copy to clipboard
            <div class="variant-filled-secondary arrow" />
        </div>
        {#if copiedVisible}
            <span out:fade>Copied!</span>
        {/if}
    </div>
</div>
