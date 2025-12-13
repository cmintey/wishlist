<script lang="ts">
    import { popup, type PopupSettings } from "@skeletonlabs/skeleton";
    import type { Snippet } from "svelte";
    import Icon from "./Icon.svelte";

    interface Props {
        label: Snippet;
        description: Snippet;
        icon?: Snippet;
    }

    const props: Props = $props();
    const id = $props.id();
    const popupId = "tooltip-" + id;

    const popupSettings: PopupSettings = {
        event: "click",
        target: popupId,
        placement: "top"
    };
</script>

<div class="flex items-center gap-2">
    {@render props.label()}
    <button class="mt-0.5" aria-label="tooltip" type="button" use:popup={popupSettings}>
        <span class="flex content-center items-center">
            {#if props.icon}
                {@render props.icon()}
            {:else}
                <Icon class="text-secondary-500" icon="ion--help-circle-outline"></Icon>
            {/if}
        </span>
    </button>
    <div class="card variant-filled-surface z-20 w-80 p-4" data-popup={popupId}>
        {@render props.description()}
        <div class="variant-filled-surface arrow"></div>
    </div>
</div>
