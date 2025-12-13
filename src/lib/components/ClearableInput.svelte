<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";
    import Icon from "./Icon.svelte";

    interface Props extends HTMLInputAttributes {
        onValueClear: () => void;
        showClearButton: () => boolean;
        clearButtonLabel: string;
        lead?: Snippet;
    }

    let { value = $bindable(), onValueClear, showClearButton, clearButtonLabel, lead, ...props }: Props = $props();
</script>

<div
    class="input-group input-group-divider grid"
    class:grid-cols-[1fr_auto]={!lead}
    class:grid-cols-[auto_1fr_auto]={lead}
>
    {@render lead?.()}
    <input bind:value {...props} />
    {#if showClearButton()}
        <button
            id="reset-{props.id}"
            class="items-center"
            aria-label={clearButtonLabel}
            onclick={onValueClear}
            onkeypress={(e) => e.preventDefault()}
            tabindex="-1"
            type="button"
        >
            <Icon class="text-xl" icon="ion--close-circle"></Icon>
        </button>
    {/if}
</div>
