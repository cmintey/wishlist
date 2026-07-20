<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    interface Props extends HTMLInputAttributes {
        icon?: string;
        error?: string;
    }

    let { icon, error, value = $bindable(), ...props }: Props = $props();

    let isGroup = $derived(icon !== undefined);
    let inputClass = $derived(isGroup ? "ig-input" : "input");

    let isError = $derived(error !== undefined);
</script>

{#snippet input()}
    <input {...props} class={[inputClass, props.class, isError && "input-invalid"]} aria-invalid={isError} bind:value />
{/snippet}

{#if isGroup}
    <div class="input-group grid-cols-[auto_1fr]">
        <div class="ig-cell preset-tonal">
            <iconify-icon icon={icon!}></iconify-icon>
        </div>
        {@render input()}
    </div>
{:else}
    {@render input()}
{/if}

{#if error}
    <p class="text-invalid pt-2">{error}</p>
{/if}
